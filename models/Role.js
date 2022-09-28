const mongoose = require('mongoose');
const Joi = require('joi');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true,
  },
  label: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  landingPage: {
    type: String,
    required: true,
    default: '/',
  },
});

const Role = mongoose.model('Role', roleSchema);

const validateRole = (role) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(3).max(255).required(),
    landingPage: Joi.string().default('/'),
    label: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(role);
};

exports.Role = Role;
exports.validate = validateRole;
