const IS_PROD = process.env.NODE_ENV === "production";

type ServerEvent = Parameters<typeof setCookie>[0];

export function setAccessTokenCookie(event: ServerEvent, token: string) {
  setCookie(event, "access_token", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: 60 * 15, // 15 minutes
    path: "/"
  });
}

export function setRefreshTokenCookie(event: ServerEvent, token: string) {
  setCookie(event, "refresh_token", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/"
  });
}

export function clearAuthCookies(event: ServerEvent) {
  deleteCookie(event, "access_token", { path: "/" });
  deleteCookie(event, "refresh_token", { path: "/" });
}
