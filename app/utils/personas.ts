// Client-side persona map for emoji lookup without importing server code.
// Must stay in sync with server/services/aiService.ts AI_PERSONAS.

export const AI_PERSONA_MAP: Record<string, { emoji: string; name: string }> = {
  analyst: { emoji: "📊", name: "Analyst" },
  philosopher: { emoji: "🧠", name: "Philosopher" },
  creative: { emoji: "🎨", name: "Creative" },
  critic: { emoji: "🔍", name: "Critic" },
  comedian: { emoji: "😄", name: "Comedian" },
  coach: { emoji: "💪", name: "Coach" },
  technical: { emoji: "⚙️", name: "Technical" },
  concise: { emoji: "⚡", name: "Concise" },
  storyteller: { emoji: "📖", name: "Storyteller" },
  debater: { emoji: "⚖️", name: "Debater" }
};
