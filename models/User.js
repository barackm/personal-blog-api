const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { jwtExpirationTime } = require('../utlis/constants');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  roles: {
    type: [String],
    validate: {
      validator: (v) => v.length > 0,
      message: 'At least one role is required',
    },
  },
  avatarUrl: {
    type: String,
  },

  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  status: {
    type: String,
    required: true,
    default: 'active',
    enum: ['active', 'inactive'],
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      roles: this.roles,
      status: this.status,
      avatarUrl: this.avatarUrl,
    },
    config.get('jwtPrivateKey'),
    { expiresIn: jwtExpirationTime },
  );
  return token;
};

const User = mongoose.model('User', userSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    roles: Joi.array().items(Joi.string()),
    avatarUrl: Joi.string(),
    status: Joi.string().valid('active', 'inactive'),
  });

  return schema.validate(user);
};

exports.User = User;
exports.validate = validateUser;
