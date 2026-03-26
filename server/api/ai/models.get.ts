import { SUPPORTED_MODELS } from "../../services/aiService";

export default defineEventHandler(() => {
  return { models: SUPPORTED_MODELS };
});
