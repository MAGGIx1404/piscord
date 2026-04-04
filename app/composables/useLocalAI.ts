import aiData from "~/data/ai_responses.json";

type AICategory = keyof typeof aiData;

interface AIEntry {
  keywords: string[];
  responses: string[];
}

const usedResponses = new Map<string, Set<number>>();

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function detectCategory(input: string): AICategory {
  const normalized = normalize(input);

  const categories = Object.keys(aiData) as AICategory[];
  let bestMatch: AICategory = "fallback";
  let bestScore = 0;

  for (const category of categories) {
    if (category === "fallback") continue;
    const entries = aiData[category] as AIEntry[];
    for (const entry of entries) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          score += keyword.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    }
  }

  return bestMatch;
}

function pickResponse(category: AICategory, input: string): string {
  const entries = aiData[category] as AIEntry[];
  if (!entries || entries.length === 0) {
    return pickResponse("fallback", input);
  }

  const entry = entries[0];
  if (!entry) {
    return "I've reviewed your text and made some improvements.";
  }

  const responses = entry.responses;
  const cacheKey = `${category}`;

  if (!usedResponses.has(cacheKey)) {
    usedResponses.set(cacheKey, new Set());
  }

  const used = usedResponses.get(cacheKey)!;

  // Reset if all responses used
  if (used.size >= responses.length) {
    used.clear();
  }

  // Pick a random unused response
  let index: number;
  do {
    index = Math.floor(Math.random() * responses.length);
  } while (used.has(index) && used.size < responses.length);

  used.add(index);

  const response = responses[index] ?? responses[0]!;

  // Extract a topic hint from input
  const words = input.split(/\s+/).filter((w) => w.length > 4);
  const topic = words.slice(0, 5).join(" ") || "the subject at hand";

  return response.replace(/\{text\}/g, input).replace(/\{topic\}/g, topic);
}

export type AIAction =
  | "rewrite"
  | "summarize"
  | "expand"
  | "improve"
  | "continue"
  | "brainstorm"
  | "fix_grammar"
  | "tone_formal"
  | "tone_casual";

export interface LocalAIResult {
  content: string;
  action: AIAction | string;
  latency_ms: number;
}

export function useLocalAI() {
  const loading = ref(false);

  function getAIResponse(input: string, action?: AIAction): LocalAIResult {
    const start = performance.now();

    const category: AICategory =
      action && action in aiData ? (action as AICategory) : detectCategory(input);

    const content = pickResponse(category, input);
    const latency_ms = Math.round(performance.now() - start);

    return { content, action: category, latency_ms };
  }

  async function runAIAction(input: string, action: AIAction): Promise<LocalAIResult> {
    loading.value = true;

    // Simulate realistic AI delay (300-700ms)
    const delay = 300 + Math.floor(Math.random() * 400);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const result = getAIResponse(input, action);
    result.latency_ms = delay;
    loading.value = false;

    return result;
  }

  return {
    loading: readonly(loading),
    getAIResponse,
    runAIAction
  };
}
