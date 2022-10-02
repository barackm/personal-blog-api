const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { User, validate } = require('../models/User');
const { Role } = require('../models/Role');
const { userRolesString, bycriptSaltRounds } = require('../utlis/constants');

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select(['-password', '-__v']).exec();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).send('User already registered.');

    const roles = await Role.find();
    const role = roles.find((r) => r.name === userRolesString.regular);
    const salt = await bcrypt.genSalt(bycriptSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roles: [role._id],
    });

    await user.save();

    const mappedRoles = user.roles.map((r) => {
      const role = roles.find((role) => role._id.toString() === r.toString());
      return role;
    });

    user.roles = mappedRoles;
    const token = user.generateAuthToken();

    res
      .header('x-auth-token', token)
      .send(
        _.pick(user, [
          '_id',
          'firstName',
          'lastName',
          'email',
          'roles',
          'status',
          'avatarUrl',
        ]),
      );
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      },
      { new: true },
    );
    if (!user)
      return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
