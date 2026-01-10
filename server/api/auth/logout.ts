export default defineEventHandler(async (event) => {
  clearSessionCookies(event);
  return { message: "ok" };
});
