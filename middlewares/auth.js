const jwt = require('jsonwebtoken');
const config = require('config');
const { authorizationTokenString } = require('../utlis/constants');

module.exports = (req, res, next) => {
  const token = req.header(authorizationTokenString);
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      config.get('jwtPrivateKey'),
    );
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};
