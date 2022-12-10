module.exports = function () {
  if (process.env.PERSONAL_PORTFOLIO_JWT_PRIVATE_KEY) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
};
