import { getTemplates } from "../../services/templateService";

export default defineEventHandler(() => {
  return { templates: getTemplates() };
});
