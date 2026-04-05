import { AI_PERSONAS } from "../../services/aiService";

export default defineEventHandler(() => {
  return { personas: AI_PERSONAS.map(({ systemPrompt: _, ...p }) => p) };
});
