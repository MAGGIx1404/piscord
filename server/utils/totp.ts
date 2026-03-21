// @ts-expect-error – speakeasy has no bundled types
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import type { TwoFactorSetupResult } from "../db/types";

const APP_NAME = "Flowcord";

export function generateTotpSecret(): { base32: string; otpauth_url: string } {
  const secret = speakeasy.generateSecret({
    name: APP_NAME,
    length: 20
  });
  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url
  };
}

export async function buildTotpSetupResult(
  email: string,
  base32: string
): Promise<TwoFactorSetupResult> {
  const otpauth = speakeasy.otpauthURL({
    secret: base32,
    label: encodeURIComponent(email),
    issuer: APP_NAME,
    encoding: "base32"
  });

  const qr_code = await QRCode.toDataURL(otpauth);

  return { qr_code, secret: base32 };
}

export function verifyTotpCode(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1
  });
}
