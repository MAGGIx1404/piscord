import { ref } from "vue";
import { puter } from "@heyputer/puter.js";
import type { ChatMessage, AIAgent } from "./useChannelChat";

// ─── Tool definitions for Puter.js native tool calling ──────────────────────

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "createChannel",
      description: "Create a new text channel in the community",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the channel to create"
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "createWorkspace",
      description: "Create a new workspace in the community",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the workspace to create"
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "sendMessage",
      description: "Send a message to a channel",
      parameters: {
        type: "object",
        properties: {
          channelId: {
            type: "string",
            description: "The ID of the channel to send the message to"
          },
          content: {
            type: "string",
            description: "The message content"
          }
        },
        required: ["content"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "renameChannel",
      description: "Rename an existing channel",
      parameters: {
        type: "object",
        properties: {
          channelId: {
            type: "string",
            description: "The ID of the channel to rename"
          },
          name: {
            type: "string",
            description: "The new name for the channel"
          }
        },
        required: ["channelId", "name"]
      }
    }
  }
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");
  }
  return content?.toString?.() || "";
}

export function useAIAgent() {
  const api = useApi();
  const processing = ref(false);

  async function generateWithOllama(
    systemPrompt: string,
    userContent: string,
    aiAgent: AIAgent
  ): Promise<string> {
    const preferredModel = aiAgent.ollama_model || aiAgent.model || "llama3.2:latest";
    const data = await api<{ message: string }>("/api/ai/chat", {
      method: "POST",
      body: {
        provider: "ollama",
        model: preferredModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ]
      }
    });
    return data.message;
  }

  function buildSystemPrompt(
    aiAgent: AIAgent,
    communityName?: string,
    canManage?: boolean
  ): string {
    const name = aiAgent.name || "Flowcord AI";
    const description = aiAgent.description || "";

    const manageNote = canManage
      ? "The user has admin/owner permissions. You can help them create channels, workspaces, and perform management tasks."
      : "The user is a regular member. They can only send messages. If they ask you to create channels, workspaces, or perform admin tasks, politely tell them they don't have permission to do that.";

    return `You are ${name}.
${description}

You exist inside a real-time community chat${communityName ? ` called "${communityName}"` : ""}.

You help users:
- answer questions
- explain technical topics
- summarize discussions
- perform actions using tools (if the user has permission)

${manageNote}

Be concise, helpful, and developer-friendly.`;
  }

  async function handleAIMention(
    userMessage: ChatMessage,
    aiAgent: AIAgent,
    channelId: string,
    communityId: string,
    canManage: boolean,
    addMessage: (msg: ChatMessage) => void
  ) {
    if (processing.value) return;
    processing.value = true;

    try {
      // Strip the @mention from the content to get the user's intent
      const aiName = aiAgent.name || "";
      const userContent =
        userMessage.content?.replace(new RegExp(`@${aiName}\\b`, "gi"), "").trim() || "";

      if (!userContent) {
        processing.value = false;
        return;
      }

      const systemPrompt = buildSystemPrompt(aiAgent, undefined, canManage);

      if (aiAgent.provider === "ollama") {
        const content = await generateWithOllama(systemPrompt, userContent, aiAgent);
        const msg = await postAIMessage(
          channelId,
          content || "I couldn't generate a response from Ollama.",
          userMessage.id
        );
        addMessage(msg);
        return;
      }

      // Check if puter.ai is available
      if (!puter?.ai) {
        const msg = await postAIMessage(
          channelId,
          "AI agent is not available right now. Please try again later.",
          userMessage.id
        );
        addMessage(msg);
        processing.value = false;
        return;
      }

      // Ensure user is authenticated with Puter
      if (!puter.auth?.isSignedIn()) {
        try {
          await puter.auth.signIn();
        } catch {
          const msg = await postAIMessage(
            channelId,
            "Please sign in with Puter to use the AI agent. Try mentioning me again after signing in.",
            userMessage.id
          );
          addMessage(msg);
          processing.value = false;
          return;
        }
      }

      // Call Puter.js AI with native tool calling
      // Per docs: puter.ai.chat(messages, testMode, options)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await puter.ai.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        // @ts-expect-error puter.js types don't match docs for testMode param
        false,
        {
          model: "claude-sonnet-4-6",
          tools: TOOLS
        }
      );

      // Check for Puter API error responses (e.g. token_missing)
      if (response?.code || (response?.message && !response?.message?.role)) {
        console.error("[AI Agent] Puter API error:", response);
        try {
          await puter.auth.signIn();
        } catch {
          // ignore sign-in failure
        }
        const msg = await postAIMessage(
          channelId,
          "Authentication with Puter expired. Please try mentioning me again.",
          userMessage.id
        );
        addMessage(msg);
        return;
      }

      // Detect tool use from the response
      // Claude format: content array with { type: "tool_use", id, name, input }
      // OpenAI format: tool_calls array with { id, function: { name, arguments } }
      const message = response?.message;
      const contentBlocks = Array.isArray(message?.content) ? message.content : [];
      const toolUseBlock = contentBlocks.find((b: { type: string }) => b.type === "tool_use");
      const openaiToolCall = message?.tool_calls?.[0];

      if (toolUseBlock || openaiToolCall) {
        // Extract tool call info from whichever format is present
        let toolName: string;
        let toolArgs: Record<string, string>;
        let toolCallId: string;

        if (toolUseBlock) {
          // Claude raw format
          toolName = toolUseBlock.name;
          toolArgs = toolUseBlock.input || {};
          toolCallId = toolUseBlock.id;
        } else {
          // OpenAI format
          toolName = openaiToolCall.function.name;
          toolCallId = openaiToolCall.id;
          try {
            toolArgs =
              typeof openaiToolCall.function.arguments === "string"
                ? JSON.parse(openaiToolCall.function.arguments)
                : openaiToolCall.function.arguments || {};
          } catch {
            toolArgs = {};
          }
        }

        // Execute the tool (with permission check)
        const toolResult = await executeTool(toolName, toolArgs, communityId, channelId, canManage);

        // Send follow-up with tool result
        // Include the assistant's message and tool result in the conversation
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const followUp: any = await puter.ai.chat(
            [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
              message, // Assistant message (contains tool_use in content)
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolCallId,
                    content: toolResult
                  }
                ]
              }
            ],
            // @ts-expect-error puter.js types don't match docs for testMode param
            false,
            { model: "claude-sonnet-4-6" }
          );

          const finalContent = extractTextContent(followUp?.message?.content) || toolResult;
          const msg = await postAIMessage(channelId, finalContent, userMessage.id);
          addMessage(msg);
        } catch {
          // If follow-up fails, just post the tool result directly
          const msg = await postAIMessage(channelId, toolResult, userMessage.id);
          addMessage(msg);
        }
      } else if (message?.content) {
        // Normal text response
        const text = extractTextContent(message.content);
        if (text) {
          const msg = await postAIMessage(channelId, text, userMessage.id);
          addMessage(msg);
        }
      } else {
        // Fallback
        const text =
          extractTextContent(response?.toString?.()) || "I couldn't generate a response.";
        const msg = await postAIMessage(channelId, text, userMessage.id);
        addMessage(msg);
      }
    } catch (error) {
      console.error("[AI Agent Error]", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      try {
        const msg = await postAIMessage(
          channelId,
          `Sorry, I encountered an error processing your request. ${message}`,
          userMessage.id
        );
        addMessage(msg);
      } catch {
        // silently fail
      }
    } finally {
      processing.value = false;
    }
  }

  async function postAIMessage(
    channelId: string,
    content: string,
    replyToId: string
  ): Promise<ChatMessage> {
    const data = await api<{ message: ChatMessage }>(`/api/channels/${channelId}/messages`, {
      method: "POST",
      body: {
        content,
        type: "ai",
        reply_to_id: replyToId
      }
    });
    return data.message;
  }

  async function executeTool(
    toolName: string,
    args: Record<string, string>,
    communityId: string,
    channelId: string,
    canManage: boolean
  ): Promise<string> {
    // Admin-only tools: createChannel, createWorkspace, renameChannel
    const adminTools = ["createChannel", "createWorkspace", "renameChannel"];
    if (adminTools.includes(toolName) && !canManage) {
      return "You don't have permission to do that. Only community owners and admins can create channels, workspaces, or manage the community.";
    }

    try {
      switch (toolName) {
        case "createChannel": {
          const name = args.name;
          if (!name) return "Error: Channel name is required.";
          await api(`/api/communities/${communityId}/channels`, {
            method: "POST",
            body: { name, type: "text" }
          });
          return `Channel #${name} has been created successfully.`;
        }

        case "createWorkspace": {
          const name = args.name;
          if (!name) return "Error: Workspace name is required.";
          await api(`/api/communities/${communityId}/workspaces`, {
            method: "POST",
            body: { name }
          });
          return `Workspace "${name}" has been created successfully.`;
        }

        case "sendMessage": {
          const content = args.content;
          const targetChannel = args.channelId || channelId;
          if (!content) return "Error: Message content is required.";
          await api(`/api/channels/${targetChannel}/messages`, {
            method: "POST",
            body: { content }
          });
          return `Message sent successfully.`;
        }

        case "renameChannel": {
          return `Channel rename is not yet supported. Please rename it manually.`;
        }

        default:
          return `Unknown tool: ${toolName}.`;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return `Failed to execute ${toolName}: ${message}`;
    }
  }

  return {
    processing,
    handleAIMention
  };
}
