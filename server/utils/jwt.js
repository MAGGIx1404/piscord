import jwt from "jsonwebtoken";

const config = useRuntimeConfig();

export function getUserFromToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyToken(token) {
  if (!token) {
    return { success: false, error: "No token" };
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    return { success: true, data: decoded };
  } catch (err) {
    console.error("Token verification error:", err);
    return { success: false, error: "Invalid token" };
  }
}
