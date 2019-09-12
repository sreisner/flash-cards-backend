const Query = {
  async me(parent, args, ctx, info) {
    if (!ctx.request.user) {
      return null;
    }

    const user = await ctx.db.query.user(
      {
        where: { id: ctx.request.user.id },
      },
      info
    );
    return user;
  },
};

module.exports = Query;
