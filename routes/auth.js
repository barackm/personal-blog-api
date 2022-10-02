const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const _ = require('lodash');
const { userResponseProperties } = require('../utlis/users');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    res
      .header('authorization', token)
      .send(_.pick(user, userResponseProperties));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
