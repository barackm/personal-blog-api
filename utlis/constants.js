const bycriptSaltRounds = 10;
const jwtExpirationTime = '24h';
const userRolesString = {
  admin: 'admin',
  contentCreator: 'contentCreator',
  regular: 'regular',
};

const authorizationTokenString = 'Authorization';

const MAIL = {
  SERVICE: 'privateemail',
  HOST: 'mail.privateemail.com',
  PORT: 465,
  USER: process.env.PERSONAL_PORTFOLIO_INFO_EMAIL_ID,
  PASS: process.env.PERSONAL_PORTFOLIO_INFO_EMAIL_PASSWORD,
};

const FRONTEND_URL = process.env.FRONTEND_URL;

module.exports = {
  bycriptSaltRounds,
  jwtExpirationTime,
  userRolesString,
  authorizationTokenString,
  MAIL,
  FRONTEND_URL,
};
