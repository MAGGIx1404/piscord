import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db, generateId } from "../db";

// ─── Load AI data ────────────────────────────────────────────────

interface AIDataEntry {
  question_variants: string[];
  answers: string[];
}

interface AIDataFile {
  categories: Record<string, AIDataEntry[]>;
  fallback: string[];
  prefixes: Record<string, string[]>;
  category_keywords: Record<string, string[]>;
}

const dataPath = resolve(process.cwd(), "app/data/ai_data.json");
const aiData: AIDataFile = JSON.parse(readFileSync(dataPath, "utf-8"));

// ─── Local matching engine (shared logic) ────────────────────────

const usedResponses = new Map<string, Set<number>>();

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

function scoreCategoryByKeywords(input: string, category: string): number {
  const keywords = aiData.category_keywords[category];
  if (!keywords) return 0;
  const normalized = normalize(input);
  let score = 0;
  for (const kw of keywords) {
    if (normalized.includes(kw.toLowerCase())) score += kw.length + 1;
  }
  return score;
}

function scoreEntry(inputTokens: string[], entry: AIDataEntry): number {
  let best = 0;
  for (const variant of entry.question_variants) {
    const variantTokens = tokenize(variant);
    let matched = 0;
    for (const vt of variantTokens) {
      if (inputTokens.some((it) => it.includes(vt) || vt.includes(it))) matched++;
    }
    const score = variantTokens.length > 0 ? matched / variantTokens.length : 0;
    if (score > best) best = score;
  }
  return best;
}

function detectCategory(input: string): string {
  const categories = Object.keys(aiData.categories);
  let bestCat = "";
  let bestScore = 0;

  for (const cat of categories) {
    const kwScore = scoreCategoryByKeywords(input, cat);
    if (kwScore > bestScore) {
      bestScore = kwScore;
      bestCat = cat;
    }
  }
  if (bestScore >= 3) return bestCat;

  const inputTokens = tokenize(input);
  for (const cat of categories) {
    const entries = aiData.categories[cat];
    if (!entries) continue;
    for (const entry of entries) {
      const score = scoreEntry(inputTokens, entry);
      if (score > bestScore) {
        bestScore = score;
        bestCat = cat;
      }
    }
  }
  return bestScore > 0.3 ? bestCat : "";
}

function findBestEntry(category: string, input: string): AIDataEntry | null {
  const entries = aiData.categories[category];
  if (!entries || entries.length === 0) return null;
  if (entries.length === 1) return entries[0];
  const inputTokens = tokenize(input);
  let best: AIDataEntry = entries[0];
  let bestScore = -1;
  for (const entry of entries) {
    const score = scoreEntry(inputTokens, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
}

function pickAnswer(answers: string[], cacheKey: string): string {
  if (!usedResponses.has(cacheKey)) usedResponses.set(cacheKey, new Set());
  const used = usedResponses.get(cacheKey)!;
  if (used.size >= answers.length) used.clear();
  let index: number;
  do {
    index = Math.floor(Math.random() * answers.length);
  } while (used.has(index) && used.size < answers.length);
  used.add(index);
  return answers[index] ?? answers[0];
}

function fillTemplate(response: string, input: string): string {
  const words = input.split(/\s+/).filter((w) => w.length > 4);
  const topic = words.slice(0, 5).join(" ") || "the subject at hand";
  return response.replace(/\{text\}/g, input).replace(/\{topic\}/g, topic);
}

function getChatResponse(input: string): string {
  const category = detectCategory(input);
  if (category && aiData.categories[category]) {
    const entry = findBestEntry(category, input);
    if (entry) return fillTemplate(pickAnswer(entry.answers, `chat_${category}`), input);
  }
  return pickAnswer(aiData.fallback, "__chat_fallback__");
}

// ─── Tool parsing (kept from original — supports createChannel, createWorkspace) ──

interface ToolCall {
  name: string;
  args: Record<string, string>;
}

function parseToolIntent(input: string, canManage: boolean): ToolCall | null {
  const normalized = input.toLowerCase();

  // Detect "create channel" intent
  const channelMatch = normalized.match(
    /create\s+(?:a\s+)?(?:new\s+)?channel\s+(?:called\s+|named\s+)?["']?([a-z0-9-]+)["']?/
  );
  if (channelMatch && canManage) {
    return { name: "createChannel", args: { name: channelMatch[1] } };
  }

  // Detect "create workspace" intent
  const workspaceMatch = normalized.match(
    /create\s+(?:a\s+)?(?:new\s+)?workspace\s+(?:called\s+|named\s+)?["']?([a-z0-9- ]+)["']?/
  );
  if (workspaceMatch && canManage) {
    return { name: "createWorkspace", args: { name: workspaceMatch[1].trim() } };
  }

  return null;
}

interface AgentConfig {
  name: string;
  description: string | null;
  communityName: string;
  canManage: boolean;
}

export async function handleChannelAI(
  userContent: string,
  config: AgentConfig,
  communityId: string,
  channelId: string,
  userId: string
): Promise<{ content: string; toolResults: string[] }> {
  const toolResults: string[] = [];

  // Check for tool intents (create channel/workspace)
  const tool = parseToolIntent(userContent, config.canManage);
  if (tool) {
    const result = await executeTool(
      tool.name,
      tool.args,
      communityId,
      channelId,
      userId,
      config.canManage
    );
    toolResults.push(result);
  }

  // Generate a conversational response from local data
  let content = getChatResponse(userContent);

  // If tool was executed, prepend/append tool result
  if (toolResults.length > 0) {
    content = toolResults.join("\n\n");
  }

  return { content, toolResults };
}

async function executeTool(
  toolName: string,
  args: Record<string, string>,
  communityId: string,
  _channelId: string,
  userId: string,
  canManage: boolean
): Promise<string> {
  const adminTools = ["createChannel", "createWorkspace", "renameChannel"];
  if (adminTools.includes(toolName) && !canManage) {
    return "You don't have permission to do that. Only community owners and admins can perform this action.";
  }

  try {
    switch (toolName) {
      case "createChannel": {
        const name = args.name;
        if (!name) return "Error: Channel name is required.";
        const id = generateId();
        await db
          .insertInto("channels")
          .values({
            id,
            community_id: communityId,
            name,
            type: "text"
          })
          .execute();
        return `Channel **#${name}** has been created.`;
      }

      case "createWorkspace": {
        const name = args.name;
        if (!name) return "Error: Workspace name is required.";
        const id = generateId();
        await db
          .insertInto("workspaces")
          .values({
            id,
            community_id: communityId,
            created_by: userId,
            name
          })
          .execute();
        return `Workspace **"${name}"** has been created.`;
      }

      default:
        return `Unknown tool: ${toolName}.`;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return `Failed to execute ${toolName}: ${message}`;
  }
}
