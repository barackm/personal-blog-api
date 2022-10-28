const mongoose = require('mongoose');
const Joi = require('joi');

const projectCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
});

const ProjectCategory = mongoose.model(
  'ProjectCategory',
  projectCategorySchema,
);

const validateProjectCategory = (projectCategory) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(1024).required(),
  });

  return schema.validate(projectCategory);
};

exports.ProjectCategory = ProjectCategory;
exports.validateProjectCategory = validateProjectCategory;
