const cookieParser = require('cookie-parser');
require('dotenv').config();
const createServer = require('./createServer');
const db = require('./db');
const jwt = require('jsonwebtoken');

const server = createServer();
server.express.use(cookieParser());

// Middleware to add the currently logged in user to each request
server.express.use(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next();

  const { userId } = jwt.verify(token, process.env.APP_SECRET);

  const user = await db.query.user(
    {
      where: { id: userId },
    },
    '{ id, email, firstName, decks { id } }'
  );

  /* eslint-disable-next-line require-atomic-updates */
  req.user = user;

  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: [process.env.FRONTEND_URL, 'http://localhost:7777'],
    },
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
