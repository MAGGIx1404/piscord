import { runAction } from "../../services/aiService";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const body = await readBody<{ text?: string; action?: string; persona?: string }>(event);
  if (!body?.text?.trim()) throw createError({ statusCode: 400, message: "Text is required" });
  if (!body?.action?.trim()) throw createError({ statusCode: 400, message: "Action is required" });

  return runAction(body.text.trim(), body.action.trim(), body.persona);
});
