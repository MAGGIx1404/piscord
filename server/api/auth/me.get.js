export default defineEventHandler(async (event) => {
  return {
    user: userTransformer(event.context.user)
  };
});
