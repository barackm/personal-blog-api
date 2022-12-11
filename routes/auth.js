const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const _ = require('lodash');
const { userResponseProperties } = require('../utlis/users');
const {
  authorizationTokenString,
  bycriptSaltRounds,
} = require('../utlis/constants');
const {
  sendEmailVerification,
  sendResetPasswordEmail,
} = require('../services/mail');
const { formatError, errorTypes } = require('../utlis/errorHandler');
const { Project } = require('../models/Project');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send(formatError('Invalid email or password.', errorTypes.validation));
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res
        .status(400)
        .send(formatError('Invalid email or password.', errorTypes.validation));
    const roles = await user.getRoles();
    const token = user.generateAuthToken();
    user.roleObjects = roles;
    const articlesCount = await user.getUserArticles().length;
    const projectsCount = await Project.countDocuments();
    user.articlesCount = articlesCount.length;
    user.projectsCount = projectsCount;
    console.log('user', user);
    res.header(authorizationTokenString, token).send({
      user: _.pick(user, userResponseProperties),
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const token = user.generateAuthToken();

    const roles = await user.getRoles();
    user.roleObjects = roles;
    const articlesCount = await user.getUserArticles();
    const projectsCount = await Project.countDocuments();
    user.articlesCount = articlesCount.length;
    user.projectsCount = projectsCount;
    console.log('articlesCount', articlesCount);
    res.header(authorizationTokenString, token).send({
      user: _.pick(user, userResponseProperties),
      token,
    });
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
    console.log(error);
  }
});

router.post('/resend-verification-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send(formatError('Invalid email.', errorTypes.notFound));

    if (user.isVerified) return res.status(400).send('User already verified.');
    const verificationToken = await bcrypt.hash(
      email + user.password,
      bycriptSaltRounds,
    );
    user.verificationToken = verificationToken;
    await user.save();
    await sendEmailVerification(user, verificationToken);
    res.send('Verification email sent.');
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/verify-email', async (req, res) => {
  const { verificationToken } = req.body;
  try {
    const user = await User.findOne({ verificationToken });
    if (!user)
      return res
        .status(400)
        .send(formatError('Invalid token.', errorTypes.notFound));
    if (user.isVerified)
      return res
        .status(400)
        .send(formatError('User already verified.', errorTypes.validation));
    user.isVerified = true;
    user.verificationToken = null;
    user.status = 'active';
    await user.save();
    const token = user.generateAuthToken();
    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    const articlesCount = await user.getUserArticles().length;
    const projectsCount = await Project.countDocuments();
    user.articlesCount = articlesCount.length;
    user.projectsCount = projectsCount;
    res
      .header(authorizationTokenString, token)
      .send({ user: _.pick(user, userResponseProperties), token });
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send(formatError('Invalid email.', errorTypes.notFound));
    const resetPasswordToken = await bcrypt.hash(
      email + user.password,
      bycriptSaltRounds,
    );
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    await sendResetPasswordEmail(user, resetPasswordToken);
    res.send('Reset password email sent.');
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/reset-password', async (req, res) => {
  const { resetPasswordToken, password } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken });
    if (!user)
      return res
        .status(400)
        .send(formatError('Invalid token.', errorTypes.notFound));
    if (user.resetPasswordExpires < Date.now())
      return res
        .status(400)
        .send(formatError('Token expired.', errorTypes.validation));
    const hashedPassword = await bcrypt.hash(password, bycriptSaltRounds);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
    const token = user.generateAuthToken();
    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    const articlesCount = await user.getUserArticles().length;
    const projectsCount = await Project.countDocuments();
    user.articlesCount = articlesCount.length;
    user.projectsCount = projectsCount;
    res
      .header(authorizationTokenString, token)
      .send({ user: _.pick(user, userResponseProperties), token });
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

module.exports = router;
