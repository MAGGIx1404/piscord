export const userTransformer = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    rank: user.rank,
    avatarUrl: user.avatarUrl,
    points: user.points
  };
};
