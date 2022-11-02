const jwt = require('jsonwebtoken');
const {
  authorizationTokenString,
  JWT_PRIVATE_KEY,
} = require('../utlis/constants');
const { formatError, errorTypes } = require('../utlis/errorHandler');

module.exports = (req, res, next) => {
  const token = req.header(authorizationTokenString);
  if (!token)
    return res
      .status(401)
      .send(formatError('Access denied. No token provided.', errorTypes));
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_PRIVATE_KEY);
    if (!decoded.isVerified) {
      return res
        .status(401)
        .send(
          formatError(
            'Access denied. User is not verified.',
            errorTypes.emailNotVerified,
          ),
        );
    }
    req.user = decoded;
    next();
  } catch (ex) {
    console.log(ex);
    res
      .status(400)
      .send(formatError('Invalid token.', errorTypes.invalidToken));
  }
};
