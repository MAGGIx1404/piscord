//
// Returns contextual suggestion chips based on keyword detection.
// Zero API calls — pure logic.

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
const LIST_PATTERNS = /\b(list|top|best|worst|compare|vs|versus|options|alternatives)\b/i;

export function getSuggestions(text: string): Suggestion[] {
  if (!text || text.trim().length < 3) return getDefaultSuggestions();

  const suggestions: Suggestion[] = [];
  const lower = text.toLowerCase().trim();

  // Code-related
  if (CODE_PATTERNS.test(text)) {
    suggestions.push(
      {
        id: "review-code",
        label: "Review code",
        prompt: `Review this code and suggest improvements:\n\n${text}`
      },
      {
        id: "explain-code",
        label: "Explain code",
        prompt: `Explain what this code does step by step:\n\n${text}`
      },
      {
        id: "fix-bugs",
        label: "Find bugs",
        prompt: `Find potential bugs or issues in this code:\n\n${text}`
      }
    );
  }

  // Questions
  if (QUESTION_PATTERNS.test(lower)) {
    suggestions.push(
      { id: "answer", label: "Answer directly", prompt: text },
      { id: "explain", label: "Explain in detail", prompt: `Explain in detail: ${text}` },
      { id: "examples", label: "Give examples", prompt: `${text}\n\nGive concrete examples.` }
    );
  }

  // Problems/errors
  if (PROBLEM_PATTERNS.test(lower)) {
    suggestions.push(
      { id: "solve", label: "Suggest solution", prompt: `Suggest a solution for: ${text}` },
      { id: "debug", label: "Debug this", prompt: `Help me debug this issue: ${text}` },
      {
        id: "alternatives",
        label: "Try alternatives",
        prompt: `What are alternative approaches to: ${text}`
      }
    );
  }

  // Opinions/debate
  if (OPINION_PATTERNS.test(lower)) {
    suggestions.push(
      { id: "counter", label: "Counter argument", prompt: `Give counter arguments to: ${text}` },
      { id: "pros-cons", label: "Pros & Cons", prompt: `List pros and cons of: ${text}` },
      {
        id: "strengthen",
        label: "Strengthen argument",
        prompt: `Strengthen this argument: ${text}`
      }
    );
  }

  // Lists/comparisons
  if (LIST_PATTERNS.test(lower)) {
    suggestions.push(
      {
        id: "compare",
        label: "Compare options",
        prompt: `Compare these options in a table: ${text}`
      },
      {
        id: "rank",
        label: "Rank them",
        prompt: `Rank these from best to worst with reasoning: ${text}`
      }
    );
  }

  // If we found specific suggestions, return top 5
  if (suggestions.length > 0) {
    return suggestions.slice(0, 5);
  }

  // Generic fallbacks
  return [
    { id: "elaborate", label: "Elaborate", prompt: `Elaborate on this: ${text}` },
    { id: "simplify", label: "Simplify", prompt: `Simplify this: ${text}` },
    { id: "summarize", label: "Summarize", prompt: `Summarize this in 3 points: ${text}` },
    { id: "examples", label: "Give examples", prompt: `Give examples of: ${text}` },
    { id: "challenge", label: "Challenge this", prompt: `Challenge this idea: ${text}` }
  ];
}

function getDefaultSuggestions(): Suggestion[] {
  return [
    { id: "brainstorm", label: "Brainstorm ideas", prompt: "Help me brainstorm ideas about " },
    { id: "explain", label: "Explain a concept", prompt: "Explain simply: " },
    { id: "compare", label: "Compare options", prompt: "Compare these options: " },
    { id: "write", label: "Help me write", prompt: "Help me write: " }
  ];
}
