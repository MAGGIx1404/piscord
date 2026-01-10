import { H3Event, EventHandlerRequest } from "h3";

export function setSessionCookies(
  event: H3Event<EventHandlerRequest>,
  session: { sessionId: string; token: string; sessionExpiresIn: number; rememberMe: boolean }
) {
  setCookie(event, "session_token", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: session.rememberMe ? session.sessionExpiresIn : undefined,
    path: "/",
    sameSite: "lax"
  });
  setCookie(event, "session_id", session.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: session.rememberMe ? session.sessionExpiresIn : undefined,
    path: "/",
    sameSite: "lax"
  });
}

export function clearSessionCookies(event: H3Event<EventHandlerRequest>) {
  setCookie(event, "session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0
  });
  setCookie(event, "session_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0
  });
}
