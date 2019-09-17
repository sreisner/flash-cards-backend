const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transport, template } = require('../mail');
const { promisify } = require('util');
const { randomBytes } = require('crypto');

// Logs the user in
function setTokenCookie(userId, ctx) {
  const token = jwt.sign({ userId }, process.env.APP_SECRET);
  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
  });
}

function requireLogggedIn(request) {
  const { user } = request;

  if (!user) {
    throw new Error('You must be logged in to do that.');
  }

  return user;
}

const Mutations = {
  async signup(parent, args, ctx, info) {
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password: await bcrypt.hash(args.password, 10),
          email: args.email.toLowerCase(),
        },
      },
      `{ id, email }`
    );

    setTokenCookie(user.id, ctx);

    await transport.sendMail({
      from: 'do-not-reply@brightflashcards.com',
      to: user.email,
      subject: 'Welcome to Bright!',
      html: template(`Welcome to Bright!`),
    });

    return await ctx.db.query.user(
      {
        where: { id: user.id },
      },
      info
    );
  },

  async signin(parent, { email, password }, ctx) {
    const user = await ctx.db.query.user({
      where: { email },
    });
    if (!user) {
      throw new Error(`No user found with email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }

    setTokenCookie(user.id, ctx);

    return user;
  },

  async signout(parent, args, ctx) {
    ctx.response.clearCookie('token');

    return { message: 'Goodbye' };
  },

  async requestReset(parent, args, ctx) {
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No user found for email ${args.email}`);
    }

    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });

    await transport.sendMail({
      from: 'donotreply@brightflashcards.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: template(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });

    return { message: 'Thanks!' };
  },
  async resetPassword(parent, args, ctx) {
    if (args.password !== args.confirmPassword) {
      throw new Error("The asswords don't match!");
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    const password = await bcrypt.hash(args.password, 10);

    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    setTokenCookie(user.id, ctx);

    return updatedUser;
  },

  async createDeck(parent, args, ctx, info) {
    const user = requireLogggedIn(ctx.request);

    const deck = await ctx.db.mutation.createDeck(
      {
        data: {
          name: args.name,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      },
      info
    );

    return deck;
  },

  async updateDeck(parent, args, ctx, info) {
    const { id, name } = args;
    const user = requireLogggedIn(ctx.request);

    if (!user.decks.some(deck => deck.id === id)) {
      throw new Error('This deck does not belong to you.');
    }

    return ctx.db.mutation.updateDeck(
      {
        data: {
          name,
        },
        where: {
          id,
        },
      },
      info
    );
  },

  async deleteDeck(parent, args, ctx) {
    const user = requireLogggedIn(ctx.request);

    if (!user.decks.some(deck => deck.id === args.id)) {
      throw new Error('This deck does not belong to you, you cannot delete it.');
    }

    const deck = await ctx.db.query.deck({ where: { id: args.id } });
    if (!deck) {
      throw new Error(`Deck ${args.id} does not exist`);
    }

    await ctx.db.mutation.deleteDeck({
      where: { id: args.id },
    });

    return {
      message: `Deck ${args.id} deleted successfully.`,
    };
  },

  async createCard(parent, args, ctx, info) {
    const user = requireLogggedIn(ctx.request);
    const { front, back, deckId } = args;

    if (!user.decks.some(deck => deck.id === deckId)) {
      throw new Error('You do not have permission to modify this deck.');
    }

    return await ctx.db.mutation.createCard(
      {
        data: {
          front,
          back,
          deck: {
            connect: {
              id: deckId,
            },
          },
        },
      },
      info
    );
  },
};

module.exports = Mutations;
