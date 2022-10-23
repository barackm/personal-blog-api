const bycriptSaltRounds = 10;
const jwtExpirationTime = '24h';
const userRolesString = {
  admin: 'admin',
  contentCreator: 'contentCreator',
  regular: 'regular',
};

const authorizationTokenString = 'Authorization';

module.exports = {
  bycriptSaltRounds,
  jwtExpirationTime,
  userRolesString,
  authorizationTokenString,
};
