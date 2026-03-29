import ollama from "ollama";
import { db, generateId } from "../db";

const MODEL = "qwen3.5:0.8b";

interface AgentConfig {
  name: string;
  description: string | null;
  communityName: string;
  canManage: boolean;
}

interface ToolCall {
  name: string;
  args: Record<string, string>;
}

function buildSystemPrompt(config: AgentConfig): string {
  const manageNote = config.canManage
    ? "The user has admin/owner permissions. You can help them create channels, workspaces, and perform management tasks."
    : "The user is a regular member. If they ask you to create channels or workspaces, politely tell them they don't have permission.";

  return `You are ${config.name}.
${config.description || "A helpful AI assistant for the community."}

You exist inside a real-time community chat called "${config.communityName}".

You help users:
- answer questions
- explain technical topics
- summarize discussions
- perform actions when asked (if the user has permission)

${manageNote}

IMPORTANT: If the user asks you to create a channel or workspace and they have permission, respond with a JSON tool call in this exact format on a new line:
[TOOL:createChannel:{"name":"channel-name"}]
or
[TOOL:createWorkspace:{"name":"workspace name"}]

Only use tool calls when the user explicitly asks to create something. Otherwise, just respond normally.

Be concise, helpful, and developer-friendly. Use markdown for formatting.`;
}

function parseToolCalls(text: string): { cleanText: string; tools: ToolCall[] } {
  const tools: ToolCall[] = [];
  const cleanText = text
    .replace(/\[TOOL:(\w+):(\{[^}]+\})\]/g, (_match, name: string, argsStr: string) => {
      try {
        tools.push({ name, args: JSON.parse(argsStr) });
      } catch {
        // ignore invalid tool calls
      }
      return "";
    })
    .trim();
  return { cleanText, tools };
}

export async function handleChannelAI(
  userContent: string,
  config: AgentConfig,
  communityId: string,
  channelId: string,
  userId: string
): Promise<{ content: string; toolResults: string[] }> {
  const systemPrompt = buildSystemPrompt(config);

  const response = await ollama.chat({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    options: {
      temperature: 0.7,
      num_predict: 1024
    }
  });

  const rawText = response.message?.content ?? "I couldn't generate a response.";
  const { cleanText, tools } = parseToolCalls(rawText);
  const toolResults: string[] = [];

  for (const tool of tools) {
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

  let finalContent = cleanText || rawText;
  if (toolResults.length > 0) {
    finalContent = [cleanText, ...toolResults].filter(Boolean).join("\n\n");
  }

  return { content: finalContent, toolResults };
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
