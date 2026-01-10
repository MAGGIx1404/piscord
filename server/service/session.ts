import type { CreateSession } from "../db/tables/session";
import { db, generateId } from "../db";
import { generateId as generateToken } from "~~/server/utils/crypto";

export async function createSession(
  session: Omit<CreateSession, "id" | "token" | "expires_at">,
  rememberMe = false
) {
  const id = generateId();
  const sessionExpiresIn = 60 * 60 * 24 * 7;
  const token = generateToken();
  const expiresAt = rememberMe
    ? new Date(Date.now() + 60 * 60 * 24 * 1000)
    : new Date(Date.now() + sessionExpiresIn * 1000);

  await db
    .insertInto("sessions")
    .values({ id, token, expires_at: expiresAt.toISOString(), ...session })
    .execute();

  return { sessionId: id, token, sessionExpiresIn };
}

export async function getSessionById(id: string) {
  const session = await db
    .selectFrom("sessions")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
  return session;
}
