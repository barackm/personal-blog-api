const nodeMailer = require('nodemailer');
const { MAIL, FRONTEND_URL } = require('../utlis/constants');
const hbs = require('nodemailer-express-handlebars');

let transporter = nodeMailer.createTransport({
  host: MAIL.HOST,
  port: MAIL.PORT,
  auth: {
    user: MAIL.USER,
    pass: MAIL.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: 'views/templates/',
      layoutsDir: 'views/templates/',
      defaultLayout: 'emailVerification.hbs',
    },
    viewPath: 'views/templates/',
    extName: '.hbs',
  }),
);

const sendMail = async (message) => {
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      return process.exit(1);
    }

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info));
  });
};

const sendEmailVerification = async (user, token) => {
  const { email, firstName, lastName } = user;
  const message = {
    from: `Barack M. <${MAIL.USER}>`,
    to: email,
    subject: 'Email Verification',
    template: 'emailVerification',
    context: {
      firstName,
      lastName,
      link: `${FRONTEND_URL}/auth/verifyEmail?token=${token}`,
    },
  };

  await sendMail(message);
};

const sendResetPasswordEmail = async (user, token) => {
  const { email, firstName, lastName } = user;
  const message = {
    from: `Barack M. <${MAIL.USER}>`,
    to: email,
    subject: 'Reset Password',
    template: 'resetPassword',
    context: {
      firstName,
      lastName,
      link: `${FRONTEND_URL}/auth/resetPassword?token=${token}`,
    },
  };

  await sendMail(message);
};

module.exports = {
  sendMail,
  transporter,
  sendEmailVerification,
  sendResetPasswordEmail,
};
