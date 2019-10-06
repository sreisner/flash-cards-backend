function requireUserLoggedIn(request) {
  const { user } = request;

  if (!user) {
    throw new Error('You must be logged in to do that.');
  }

  return user;
}

module.exports = {
  requireUserLoggedIn,
};
