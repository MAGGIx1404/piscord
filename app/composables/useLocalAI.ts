import aiData from "~/data/ai_data.json";

// ─── Types ───────────────────────────────────────────────────────

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

export type AIAction =
  | "rewrite"
  | "summarize"
  | "expand"
  | "improve"
  | "continue"
  | "brainstorm"
  | "fix_grammar"
  | "tone_formal"
  | "tone_casual"
  | "explain"
  | "compare"
  | "feedback";

export type AIMode = "editor" | "chat";

export interface LocalAIResult {
  content: string;
  action: string;
  latency_ms: number;
}

// ─── Matching Engine ─────────────────────────────────────────────

const data = aiData as AIDataFile;
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

/** Score a category by matching its keywords against the input tokens */
function scoreCategoryByKeywords(input: string, category: string): number {
  const keywords = data.category_keywords[category];
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

/** Score how well input matches a specific entry's question_variants */
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

/** Detect the best category for a free-text input */
function detectCategory(input: string): string {
  const categories = Object.keys(data.categories);
  let bestCat = "";
  let bestScore = 0;

  for (const cat of categories) {
    const kwScore = scoreCategoryByKeywords(input, cat);
    if (kwScore > bestScore) {
      bestScore = kwScore;
      bestCat = cat;
    }
  }

  // If keyword matching found a strong match, use it
  if (bestScore >= 3) return bestCat;

  // Fall back to entry-level fuzzy matching
  const inputTokens = tokenize(input);
  for (const cat of categories) {
    const entries = data.categories[cat];
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

/** Find the best-matching entry within a category */
function findBestEntry(category: string, input: string): AIDataEntry | null {
  const entries = data.categories[category];
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

/** Pick a response with anti-repetition */
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

/** Replace template variables in response */
function fillTemplate(response: string, input: string): string {
  const words = input.split(/\s+/).filter((w) => w.length > 4);
  const topic = words.slice(0, 5).join(" ") || "the subject at hand";
  return response.replace(/\{text\}/g, input).replace(/\{topic\}/g, topic);
}

/** Get a random prefix for the given mode */
function getPrefix(mode: AIMode): string {
  const prefixes = data.prefixes[mode];
  if (!prefixes || prefixes.length === 0) return "";
  return prefixes[Math.floor(Math.random() * prefixes.length)] ?? "";
}

/** Pick a fallback response */
function getFallback(): string {
  return pickAnswer(data.fallback, "__fallback__");
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Core matching function. Returns the best response for the given input.
 * - If `action` is provided (editor actions like rewrite/summarize), uses that category directly
 * - If no action, detects category from input text (chat mode)
 */
function getBestResponse(input: string, action?: string, mode: AIMode = "editor"): LocalAIResult {
  const start = performance.now();

  // Direct action → use that category
  let category = action && data.categories[action] ? action : "";

  // No direct action → detect from input
  if (!category) {
    category = detectCategory(input);
  }

  let content: string;

  if (category && data.categories[category]) {
    const entry = findBestEntry(category, input);
    if (entry) {
      const raw = pickAnswer(entry.answers, category);
      content = fillTemplate(raw, input);
    } else {
      content = getFallback();
    }
  } else {
    content = getFallback();
  }

  // Prepend a mode-appropriate prefix for chat responses (not editor actions)
  if (mode === "chat" && !action) {
    const prefix = getPrefix(mode);
    if (prefix && !content.startsWith("**") && !content.startsWith("#")) {
      content = prefix + content;
    }
  }

  const latency_ms = Math.round(performance.now() - start);
  return { content, action: category || "fallback", latency_ms };
}

export function useLocalAI() {
  const loading = ref(false);

  function getAIResponse(input: string, action?: AIAction): LocalAIResult {
    return getBestResponse(input, action, "editor");
  }

  async function runAIAction(input: string, action: AIAction): Promise<LocalAIResult> {
    loading.value = true;

    // Simulate realistic AI delay (300-700ms)
    const delay = 300 + Math.floor(Math.random() * 400);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const result = getBestResponse(input, action, "editor");
    result.latency_ms = delay;
    loading.value = false;

    return result;
  }

  /** For channel chat — no simulated delay needed (server adds its own) */
  function getChatResponse(input: string): LocalAIResult {
    return getBestResponse(input, undefined, "chat");
  }

  return {
    loading: readonly(loading),
    getAIResponse,
    runAIAction,
    getChatResponse,
    getBestResponse
  };
}
