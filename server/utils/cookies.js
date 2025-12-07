export function clearCookie(event, name) {
  setCookie(event, name, "", {
    maxAge: -1,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
}
