const bycriptSaltRounds = 10;
const jwtExpirationTime = '24h';
const userRolesString = {
  admin: 'admin',
  contentCreator: 'contentCreator',
  regular: 'regular',
};

const CLOUDINARY = {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY,
  API_SECRET: process.env.CLOUDINARY_API_SECRET,
  UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
  UPLOAD_PRESET_ARTICLES: process.env.CLOUDINARY_UPLOAD_PRESET_ARTICLES,
};

const authorizationTokenString = 'Authorization';

const MAIL = {
  SERVICE: process.env.MAIL_SERVICE,
  HOST: process.env.MAIL_HOST,
  PORT: process.env.MAIL_PORT,
  USER: process.env.INFO_EMAIL_ID,
  PASS: process.env.INFO_EMAIL_PASSWORD,
};
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const DB = {
  URL: process.env.DB_URL,
};

module.exports = {
  bycriptSaltRounds,
  jwtExpirationTime,
  userRolesString,
  authorizationTokenString,
  MAIL,
  FRONTEND_URL,
  CLOUDINARY,
  DB,
  JWT_PRIVATE_KEY,
};
