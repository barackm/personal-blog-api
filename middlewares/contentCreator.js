const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const {
  authorizationTokenString,
  JWT_PRIVATE_KEY,
} = require('../utlis/constants');
const { errorTypes, formatError } = require('../utlis/errorHandler');

module.exports = async (req, res, next) => {
  const token = req.header(authorizationTokenString);
  if (!token)
    return res
      .status(401)
      .send(formatError('Access denied. No token provided.', errorTypes));
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_PRIVATE_KEY);
    const user = await User.findById(decoded._id).select('-password');
    req.user = user;
    const isAdmin = await user.isAdmin();
    const isContentCreator = await user.isContentCreator();

    if (!isAdmin && !isContentCreator)
      return res
        .status(403)
        .send(
          formatError(
            "Access denied. You don't have enough permissions.",
            errorTypes.unauthorized,
          ),
        );

    if (!user.isVerified) {
      return res
        .status(401)
        .send(
          formatError(
            'Access denied. User is not verified.',
            errorTypes.emailNotVerified,
          ),
        );
    }

    next();
  } catch (ex) {
    res
      .status(400)
      .send(formatError('Invalid token.', errorTypes.invalidToken));
  }
};
