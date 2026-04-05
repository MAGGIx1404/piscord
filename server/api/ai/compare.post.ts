import { runCompare } from "../../services/aiService";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const body = await readBody<{ prompt?: string }>(event);
  if (!body?.prompt?.trim()) throw createError({ statusCode: 400, message: "Prompt is required" });

  return runCompare(body.prompt.trim());
});
