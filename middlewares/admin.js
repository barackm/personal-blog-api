const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../models/user');
const { authorizationTokenString } = require('../utlis/constants');

module.exports = async (req, res, next) => {
  const token = req.header(authorizationTokenString);
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const user = await User.findById(decoded._id).select('-password');
    req.user = user;
    console.log(user);
    const isAdmin = await user.isAdmin();
    if (!isAdmin)
      return res.status(403).send('Access denied. You are not an admin.');

    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};
