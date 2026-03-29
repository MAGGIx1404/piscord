//
// Predefined prompt templates. No API calls.
// Users click a template → it fills the prompt input with {input} placeholder.

export interface PromptTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  template: string;
}

export function getTemplates(): PromptTemplate[] {
  return [
    {
      id: "summarize",
      name: "Summarize",
      emoji: "📝",
      description: "Condense into key points",
      template: "Summarize this in 3 clear bullet points:\n\n{input}"
    },
    {
      id: "explain",
      name: "Explain",
      emoji: "💡",
      description: "Explain in simple terms",
      template: "Explain this in simple terms that anyone can understand:\n\n{input}"
    },
    {
      id: "debate",
      name: "Debate",
      emoji: "⚖️",
      description: "Counter arguments",
      template: "Give strong counter arguments to the following:\n\n{input}"
    },
    {
      id: "brainstorm",
      name: "Brainstorm",
      emoji: "🧠",
      description: "Generate ideas",
      template: "Brainstorm 5 creative ideas for:\n\n{input}"
    },
    {
      id: "code-review",
      name: "Code Review",
      emoji: "🔍",
      description: "Review code quality",
      template: "Review this code for bugs, performance issues, and best practices:\n\n{input}"
    },
    {
      id: "pros-cons",
      name: "Pros & Cons",
      emoji: "📊",
      description: "Weigh both sides",
      template: "List the pros and cons of:\n\n{input}"
    },
    {
      id: "action-plan",
      name: "Action Plan",
      emoji: "🎯",
      description: "Create actionable steps",
      template: "Create a clear action plan with specific steps for:\n\n{input}"
    },
    {
      id: "rewrite",
      name: "Rewrite",
      emoji: "✏️",
      description: "Improve writing",
      template: "Rewrite this to be clearer and more professional:\n\n{input}"
    }
  ];
}
