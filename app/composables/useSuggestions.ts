import { useDebounceFn } from "@vueuse/core";

export interface Suggestion {
  id: string;
  label: string;
  prompt: string;
}

const CODE_PATTERNS =
  /\b(function|const|let|var|class|import|export|async|await|return|if|for|while|def|print)\b|[{}();=><]/;
const QUESTION_PATTERNS =
  /^(what|how|why|when|where|who|which|can|could|should|would|is|are|do|does|will)\b/i;
const PROBLEM_PATTERNS = /\b(error|bug|issue|problem|fail|broken|crash|wrong|stuck|help|fix)\b/i;
const OPINION_PATTERNS = /\b(think|believe|opinion|feel|agree|disagree|better|worse|prefer)\b/i;

export function useSuggestions() {
  const suggestions = ref<Suggestion[]>([]);
  const inputText = ref("");

  const compute = useDebounceFn((text: string) => {
    if (!text || text.trim().length < 3) {
      suggestions.value = [];
      return;
    }

    const result: Suggestion[] = [];
    const lower = text.toLowerCase().trim();

    if (CODE_PATTERNS.test(text)) {
      result.push(
        {
          id: "review-code",
          label: "Review code",
          prompt: `Review this code and suggest improvements:\n\n${text}`
        },
        {
          id: "explain-code",
          label: "Explain code",
          prompt: `Explain what this code does:\n\n${text}`
        }
      );
    }

    if (QUESTION_PATTERNS.test(lower)) {
      result.push(
        { id: "answer", label: "Answer directly", prompt: text },
        { id: "explain", label: "Explain in detail", prompt: `Explain in detail: ${text}` }
      );
    }

    if (PROBLEM_PATTERNS.test(lower)) {
      result.push(
        { id: "solve", label: "Suggest solution", prompt: `Suggest a solution for: ${text}` },
        { id: "debug", label: "Debug this", prompt: `Help me debug: ${text}` }
      );
    }

    if (OPINION_PATTERNS.test(lower)) {
      result.push(
        { id: "counter", label: "Counter argument", prompt: `Give counter arguments to: ${text}` },
        { id: "pros-cons", label: "Pros & Cons", prompt: `List pros and cons of: ${text}` }
      );
    }

    if (result.length === 0) {
      result.push(
        { id: "elaborate", label: "Elaborate", prompt: `Elaborate on this: ${text}` },
        { id: "simplify", label: "Simplify", prompt: `Simplify this: ${text}` },
        { id: "summarize", label: "Summarize", prompt: `Summarize in 3 points: ${text}` }
      );
    }

    suggestions.value = result.slice(0, 4);
  }, 300);

  function updateText(text: string) {
    inputText.value = text;
    compute(text);
  }

  function clear() {
    suggestions.value = [];
    inputText.value = "";
  }

  return { suggestions, updateText, clear };
}
