import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ─── Load AI data from shared JSON ───────────────────────────────

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

// ─── Anti-repetition tracking ────────────────────────────────────

const usedResponses = new Map<string, Set<number>>();

// ─── Matching utilities ──────────────────────────────────────────

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
    if (normalized.includes(kw.toLowerCase())) {
      score += kw.length + 1;
    }
  }
  return score;
}

function scoreEntry(inputTokens: string[], entry: AIDataEntry): number {
  let best = 0;
  for (const variant of entry.question_variants) {
    const variantTokens = tokenize(variant);
    let matched = 0;
    for (const vt of variantTokens) {
      if (inputTokens.some((it) => it.includes(vt) || vt.includes(it))) {
        matched++;
      }
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
  if (entries.length === 1) return entries[0] ?? null;

  const inputTokens = tokenize(input);
  let best: AIDataEntry | null = entries[0] ?? null;
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
  if (!usedResponses.has(cacheKey)) {
    usedResponses.set(cacheKey, new Set());
  }
  const used = usedResponses.get(cacheKey)!;

  if (used.size >= answers.length) {
    used.clear();
  }

  let index: number;
  do {
    index = Math.floor(Math.random() * answers.length);
  } while (used.has(index) && used.size < answers.length);

  used.add(index);
  return answers[index] ?? answers[0] ?? "";
}

function fillTemplate(response: string, input: string): string {
  const words = input.split(/\s+/).filter((w) => w.length > 4);
  const topic = words.slice(0, 5).join(" ") || "the subject at hand";
  return response.replace(/\{text\}/g, input).replace(/\{topic\}/g, topic);
}

function getResponse(input: string, action?: string): string {
  let category = action && aiData.categories[action] ? action : "";

  if (!category) {
    category = detectCategory(input);
  }

  if (category && aiData.categories[category]) {
    const entry = findBestEntry(category, input);
    if (entry) {
      return fillTemplate(pickAnswer(entry.answers, category), input);
    }
  }

  return pickAnswer(aiData.fallback, "__fallback__");
}

export interface AIPersona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  systemPrompt: string;
}

export const AI_PERSONAS: AIPersona[] = [
  {
    id: "analyst",
    name: "Analyst",
    emoji: "📊",
    description: "Data-driven, structured, logical",
    systemPrompt: "Analytical style"
  },
  {
    id: "philosopher",
    name: "Philosopher",
    emoji: "🧠",
    description: "Deep, abstract, thought-provoking",
    systemPrompt: "Philosophical style"
  },
  {
    id: "creative",
    name: "Creative",
    emoji: "🎨",
    description: "Imaginative, bold, unconventional",
    systemPrompt: "Creative style"
  },
  {
    id: "critic",
    name: "Critic",
    emoji: "🔍",
    description: "Rigorous, challenging, detail-oriented",
    systemPrompt: "Critical style"
  },
  {
    id: "comedian",
    name: "Comedian",
    emoji: "😄",
    description: "Witty, fun, entertaining",
    systemPrompt: "Comedic style"
  },
  {
    id: "coach",
    name: "Coach",
    emoji: "💪",
    description: "Motivating, actionable, supportive",
    systemPrompt: "Coaching style"
  },
  {
    id: "technical",
    name: "Technical",
    emoji: "⚙️",
    description: "Precise, code-focused, engineering",
    systemPrompt: "Technical style"
  },
  {
    id: "concise",
    name: "Concise",
    emoji: "⚡",
    description: "Brief, fast, to-the-point",
    systemPrompt: "Concise style"
  },
  {
    id: "storyteller",
    name: "Storyteller",
    emoji: "📖",
    description: "Narrative, engaging, illustrative",
    systemPrompt: "Storytelling style"
  },
  {
    id: "debater",
    name: "Debater",
    emoji: "⚖️",
    description: "Balanced, argues both sides",
    systemPrompt: "Debate style"
  }
];

// ─── Exported interfaces (kept compatible with existing API routes) ──

export interface RunAIParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  config?: {
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  };
  memoryContext?: string;
}

export interface RunAIResult {
  content: string;
  latency_ms: number;
  model: string;
}

export async function runAI(params: RunAIParams): Promise<RunAIResult> {
  const startTime = Date.now();

  // Extract user's last message as input
  const lastUserMsg = [...params.messages].reverse().find((m) => m.role === "user");
  const input = lastUserMsg?.content ?? "";

  const content = getResponse(input);
  const latency_ms = Date.now() - startTime;

  return { content, latency_ms, model: params.model };
}

const SUPPORTED_ACTIONS = new Set([
  "summarize",
  "rewrite",
  "improve",
  "counter",
  "explain",
  "expand",
  "fix_grammar",
  "tone_formal",
  "tone_casual",
  "continue",
  "brainstorm",
  "feedback"
]);

export async function runAction(
  text: string,
  action: string,
  _personaId?: string
): Promise<RunAIResult> {
  if (!SUPPORTED_ACTIONS.has(action)) {
    throw createError({ statusCode: 400, message: `Unknown action: ${action}` });
  }

  const startTime = Date.now();
  const content = getResponse(text, action);
  const latency_ms = Date.now() - startTime;

  return { content, latency_ms, model: _personaId ?? "concise" };
}

export interface CompareResult {
  perspectives: Array<{ label: string; content: string }>;
  latency_ms: number;
}

export async function runCompare(prompt: string): Promise<CompareResult> {
  const startTime = Date.now();

  // Generate 3 different perspectives from the data
  const labels = ["Perspective A", "Perspective B", "Perspective C"];
  const angles = [
    { label: "Practical View", cat: "productivity" },
    { label: "Creative View", cat: "creativity" },
    { label: "Strategic View", cat: "planning" }
  ];

  const perspectives = angles.map((angle, i) => {
    const content = getResponse(prompt, angle.cat);
    return { label: `${labels[i]}: ${angle.label}`, content };
  });

  const latency_ms = Date.now() - startTime;
  return { perspectives, latency_ms };
}
