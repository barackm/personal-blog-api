const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const bcrypt = require('bcrypt');
const _ = require('lodash');

const {
  User,
  validate,
  bulkEditValidate,
  profileValidate,
} = require('../models/User');
const { Role } = require('../models/Role');
const {
  userRolesString,
  bycriptSaltRounds,
  authorizationTokenString,
} = require('../utlis/constants');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { userResponseProperties } = require('../utlis/users');
const { sendEmailVerification } = require('../services/mail');
const { errorTypes, formatError } = require('../utlis/errorHandler');
const { uploadProfileImage } = require('../services/cloudinary');

router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select(['-password', '-__v']).exec();
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await user.getRoles();
        return {
          ...user._doc,
          roleObjects: userRoles,
        };
      }),
    );
    res.status(200).json(usersWithRoles);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.get('/:id', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .send(formatError('User not found.', errorTypes.notFound));
    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    res.send(_.pick(user, userResponseProperties));
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/register', async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send(formatError(error.details[0].message, errorTypes.validation));
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .send(
          formatError('User already registered.', errorTypes.alreadyExists),
        );

    const roles = await Role.find();
    const role = roles.find((r) => r.name === userRolesString.regular);
    const salt = await bcrypt.genSalt(bycriptSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = await bcrypt.hash(
      email + password,
      bycriptSaltRounds,
    );

    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roles: [role._id],
      verificationToken,
      isVerified: false,
      avatarUrl:
        'https://res.cloudinary.com/barackm/image/upload/v1670682216/personal-portfolio/60111_rx4ftj.jpg',
    });

    await user.save();

    const token = user.generateAuthToken();

    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    await sendEmailVerification(user, verificationToken);
    res
      .header(authorizationTokenString, token)
      .send({ user: _.pick(user, userResponseProperties), token });
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/:id', [auth], async (req, res) => {
  const { error } = profileValidate(req.body);
  if (error)
    return res
      .status(400)
      .send(formatError(error.details[0].message, errorTypes.validation));

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
      return res
        .status(404)
        .send(formatError('User not found.', errorTypes.notFound));

    if (user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }

    const token = user.generateAuthToken();

    res.header(authorizationTokenString, token).send(user);
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/admin/:id', [auth, admin], async (req, res) => {
  const { error } = bulkEditValidate(req.body);
  if (error)
    return res
      .status(400)
      .send(formatError(error.details[0].message, errorTypes.validation));

  try {
    const { firstName, lastName, email, roles, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .send(formatError('User not found.', errorTypes.notFound));

    const rolesIds = roles.map((r) => r._id);
    user.roles = rolesIds;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.status = status;
    await user.save();

    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    res.send(_.pick(user, userResponseProperties));
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/:id/roles', [auth, admin], async (req, res) => {
  const { roles } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .send(formatError('User not found.', errorTypes.notFound));

    const rolesIds = roles.map((r) => r._id);
    user.roles = rolesIds;
    const token = user.generateAuthToken();

    await user.save();

    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    res
      .header(authorizationTokenString, token)
      .send(_.pick(user, userResponseProperties));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user)
      return res
        .status(404)
        .send(formatError('User not found.', errorTypes.notFound));
    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    res.send(_.pick(user, userResponseProperties));
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/:id/status', [auth, admin], async (req, res) => {
  const { status } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .send(formatError('User not found.', errorTypes.notFound));
    user.status = status;
    await user.save();
    const userRoles = await user.getRoles();
    user.roleObjects = userRoles;
    res.send(_.pick(user, userResponseProperties));
  } catch (error) {
    res.status(500).send(formatError(error.message, errorTypes.serverError));
  }
});

// change profile picture
router.put(
  '/:id/avatar',
  [auth, upload.single('avatarUrl')],
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const image = req.file;
      let uploadedImage = null;

      if (!user)
        return res
          .status(404)
          .send(formatError('User not found.', errorTypes.notFound));

      if (user._id.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .send(formatError('Forbidden', errorTypes.forbidden));
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .send(formatError('Forbidden', errorTypes.forbidden));
      }

      if (image) {
        uploadedImage = await uploadProfileImage(image);
      }
      user.avatarUrl = uploadedImage
        ? uploadedImage.secure_url
        : user.avatarUrl;

      await user.save();
      const token = user.generateAuthToken();
      res.header(authorizationTokenString, token).send(user);
    } catch (error) {
      res.status(500).send(formatError(error.message, errorTypes.serverError));
    }
  },
);

module.exports = router;
