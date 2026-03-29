import ollama from "ollama";

const MODEL = "qwen3.5:0.8b";

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
    systemPrompt:
      "You are an analytical AI assistant. Break down problems with data and logic. Use structured reasoning, bullet points, and clear evidence. Be precise and objective."
  },
  {
    id: "philosopher",
    name: "Philosopher",
    emoji: "🧠",
    description: "Deep, abstract, thought-provoking",
    systemPrompt:
      "You are a philosophical AI assistant. Explore ideas deeply and abstractly. Consider multiple perspectives, ask probing questions, and connect ideas to broader themes. Be thoughtful and nuanced."
  },
  {
    id: "creative",
    name: "Creative",
    emoji: "🎨",
    description: "Imaginative, bold, unconventional",
    systemPrompt:
      "You are a creative AI assistant. Think outside the box. Offer unexpected angles, metaphors, and innovative solutions. Be bold and imaginative in your responses."
  },
  {
    id: "critic",
    name: "Critic",
    emoji: "🔍",
    description: "Rigorous, challenging, detail-oriented",
    systemPrompt:
      "You are a critical AI assistant. Challenge assumptions, find weaknesses, and push for stronger thinking. Be constructive but rigorous. Point out what others might miss."
  },
  {
    id: "comedian",
    name: "Comedian",
    emoji: "😄",
    description: "Witty, fun, entertaining",
    systemPrompt:
      "You are a witty AI assistant with a great sense of humor. Keep responses entertaining and light while still being helpful. Use humor, analogies, and clever observations."
  },
  {
    id: "coach",
    name: "Coach",
    emoji: "💪",
    description: "Motivating, actionable, supportive",
    systemPrompt:
      "You are a motivational AI coach. Focus on actionable advice, encouragement, and practical steps. Help users build confidence and take action. Be supportive and direct."
  },
  {
    id: "technical",
    name: "Technical",
    emoji: "⚙️",
    description: "Precise, code-focused, engineering",
    systemPrompt:
      "You are a technical AI assistant. Focus on code, architecture, and engineering best practices. Provide precise, implementable solutions with code examples when relevant. Be concise and accurate."
  },
  {
    id: "concise",
    name: "Concise",
    emoji: "⚡",
    description: "Brief, fast, to-the-point",
    systemPrompt:
      "You are a concise AI assistant. Give the shortest, most direct answer possible. No fluff, no filler. If it can be said in one sentence, say it in one sentence."
  },
  {
    id: "storyteller",
    name: "Storyteller",
    emoji: "📖",
    description: "Narrative, engaging, illustrative",
    systemPrompt:
      "You are a storytelling AI assistant. Explain concepts through stories, examples, and vivid narratives. Make complex ideas accessible through engaging storytelling."
  },
  {
    id: "debater",
    name: "Debater",
    emoji: "⚖️",
    description: "Balanced, argues both sides",
    systemPrompt:
      "You are a debate AI assistant. Present multiple sides of every argument fairly. Weigh pros and cons, consider trade-offs, and help users see the full picture before making decisions."
  }
];

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

  const persona = AI_PERSONAS.find((p) => p.id === params.model);
  const parts = [
    persona?.systemPrompt ?? "",
    params.config?.system_prompt ?? "",
    params.memoryContext ? `\n\nWorkspace context:\n${params.memoryContext}` : ""
  ].filter(Boolean);
  const systemInstruction = parts.join("\n\n");

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  for (const m of params.messages) {
    messages.push({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content
    });
  }

  const response = await ollama.chat({
    model: MODEL,
    messages,
    options: {
      temperature: params.config?.temperature ?? 0.7,
      num_predict: params.config?.max_tokens ?? 2048
    }
  });

  const latency_ms = Date.now() - startTime;
  const content = response.message?.content ?? "";

  if (!content) {
    throw createError({ statusCode: 502, message: "Empty response from AI provider" });
  }

  return { content, latency_ms, model: params.model };
}

const ACTION_PROMPTS: Record<string, string> = {
  summarize: "Summarize the following text concisely in 3-5 bullet points:\n\n",
  rewrite: "Rewrite the following text to be clearer and more professional:\n\n",
  improve:
    "Improve the following text — fix grammar, enhance clarity, and strengthen the argument:\n\n",
  counter: "Provide strong counter-arguments to the following:\n\n",
  explain: "Explain the following in simple terms that anyone can understand:\n\n",
  expand: "Expand on the following with more detail, examples, and depth:\n\n"
};

export async function runAction(
  text: string,
  action: string,
  personaId?: string
): Promise<RunAIResult> {
  const actionPrompt = ACTION_PROMPTS[action];
  if (!actionPrompt) {
    throw createError({ statusCode: 400, message: `Unknown action: ${action}` });
  }

  return runAI({
    model: personaId ?? "concise",
    messages: [{ role: "user", content: actionPrompt + text }]
  });
}

export interface CompareResult {
  perspectives: Array<{ label: string; content: string }>;
  latency_ms: number;
}

export async function runCompare(prompt: string): Promise<CompareResult> {
  const startTime = Date.now();

  const comparePrompt = `Give exactly 3 different perspectives on the following topic. Format your response as:

**Perspective A: [Title]**
[Content]

**Perspective B: [Title]**
[Content]

**Perspective C: [Title]**
[Content]

Topic: ${prompt}`;

  const response = await ollama.chat({
    model: MODEL,
    messages: [{ role: "user", content: comparePrompt }],
    options: { temperature: 0.9 }
  });

  const latency_ms = Date.now() - startTime;
  const text = response.message?.content ?? "";

  const sections = text.split(/\*\*Perspective [A-C]:/);
  const perspectives: Array<{ label: string; content: string }> = [];
  const labels = ["Perspective A", "Perspective B", "Perspective C"];

  for (let i = 1; i < sections.length && i <= 3; i++) {
    const section = sections[i].trim();
    const titleEnd = section.indexOf("**");
    const title = titleEnd > 0 ? section.slice(0, titleEnd).trim() : labels[i - 1];
    const content = titleEnd > 0 ? section.slice(titleEnd + 2).trim() : section;
    perspectives.push({ label: `${labels[i - 1]}: ${title}`, content });
  }

  if (perspectives.length === 0) {
    perspectives.push({ label: "Perspective A", content: text });
  }

  return { perspectives, latency_ms };
}
