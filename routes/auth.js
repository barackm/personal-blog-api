const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const _ = require('lodash');
const { userResponseProperties } = require('../utlis/users');
const { authorizationTokenString } = require('../utlis/constants');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password.');
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send('Invalid email or password.');
    const token = user.generateAuthToken();

    const roles = await user.getRoles();
    user.roleObjects = roles;

    res.header(authorizationTokenString, token).send({
      user: _.pick(user, userResponseProperties),
      token,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const token = user.generateAuthToken();

    const roles = await user.getRoles();
    user.roleObjects = roles;
    res.header(authorizationTokenString, token).send({
      user: _.pick(user, userResponseProperties),
      token,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
