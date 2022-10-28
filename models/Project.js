const mongoose = require('mongoose');
const Joi = require('joi');

const projectSchema = new mongoose.Schema({
  title: {
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
  imageUrl: {
    type: String,
  },
  sourceCodeUrl: {
    type: String,
  },
  liveDemoUrl: {
    type: String,
  },
  technologies: {
    type: [String],
    required: true,
  },
  tags: {
    type: [String],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model('Project', projectSchema);

const validateProject = (project) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(1024).required(),
    imageUrl: Joi.string(),
    sourceCodeUrl: Joi.string(),
    liveDemoUrl: Joi.string(),
    technologies: Joi.array().items(Joi.string()).required(),
    tags: Joi.array().items(Joi.string()),
    categoryId: Joi.string().required(),
  });

  return schema.validate(project);
};

exports.Project = Project;
exports.validate = validateProject;
