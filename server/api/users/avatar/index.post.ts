import { uploadAvatar } from "../../../services/userService";

/**
 * POST /api/users/avatar
 * Multipart form-data: field name "avatar" (image file, max 5 MB).
 * Returns the public avatar URL.
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  return uploadAvatar(event, userId);
});
