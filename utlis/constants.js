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

const CLOUDINARY = {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY,
  API_SECRET: process.env.CLOUDINARY_API_SECRET,
  UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
};

module.exports = {
  bycriptSaltRounds,
  jwtExpirationTime,
  userRolesString,
  authorizationTokenString,
  MAIL,
  FRONTEND_URL,
  CLOUDINARY,
};
