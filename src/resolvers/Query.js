const { requireUserLoggedIn } = require('../utils');
const { forwardTo } = require('prisma-binding');

const Query = {
  decksConnection: forwardTo('db'),
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

  async deck(parent, args, ctx, info) {
    requireUserLoggedIn(ctx.request);

    if (!ctx.request.user.decks.find(deck => deck.id === args.id)) {
      throw `This deck doesn't exist or you don't have permission to see this deck!`;
    }

    return await ctx.db.query.deck(
      {
        where: { id: args.id },
      },
      info
    );
  },

  async decks(parent, args, ctx, info) {
    requireUserLoggedIn(ctx.request);

    return await ctx.db.query.decks(
      {
        where: {
          user: {
            id: ctx.request.user.id,
          },
        },
      },
      info
    );
  },
};

module.exports = Query;
