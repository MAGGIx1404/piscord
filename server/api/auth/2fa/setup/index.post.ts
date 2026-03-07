import { setup2FA } from "../../../../services/authService";

/**
 * POST /api/auth/2fa/setup
 * Returns QR code data-URI and base32 secret.
 * Requires authenticated user.
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const result = await setup2FA(userId);
  return result;
});
