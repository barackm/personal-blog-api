const { transporter } = require('../services/mail');

module.exports = function () {
  transporter.verify(function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });
};
