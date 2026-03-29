import { AI_PERSONAS } from "../../services/aiService";

// Backward-compatible — returns personas as "models"
export default defineEventHandler(() => {
  return {
    models: AI_PERSONAS.map((p) => ({
      id: p.id,
      name: p.name,
      provider: p.emoji
    }))
  };
});
