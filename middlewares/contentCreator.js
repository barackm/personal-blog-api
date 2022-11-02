const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const {
  authorizationTokenString,
  JWT_PRIVATE_KEY,
} = require('../utlis/constants');

module.exports = async (req, res, next) => {
  const token = req.header(authorizationTokenString);
  if (!token) return res.status(401).send('Access denied. No token provided.');
  try {
    const decoded = jwt.verify(token, JWT_PRIVATE_KEY);
    const user = await User.findById(decoded._id).select('-password');
    req.user = user;
    const isAdmin = await user.isAdmin();
    const isContentCreator = await user.isContentCreator();

    if (!isAdmin && !isContentCreator)
      return res
        .status(403)
        .send("Access denied. You don't have enough permissions.");

    if (!user.isVerified) {
      return res.status(401).send('Access denied. User is not verified.');
    }

    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};
