import { getSuggestions } from "../../services/suggestionService";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ text?: string }>(event);
  return { suggestions: getSuggestions(body?.text ?? "") };
});
