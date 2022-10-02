const mongoose = require('mongoose');
const Joi = require('joi');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  //   userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User',
  //     required: true,
  //   },
  mainImageUrl: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 5,
  },
  tags: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
  },
  scheduledAt: {
    type: Date,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  savedDraft: {
    type: Boolean,
    default: false,
  },
});

const Article = mongoose.model('Article', articleSchema);

const validateArticle = (article) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    mainImageUrl: Joi.string().required(),
    content: Joi.string().min(5).required(),
    tags: Joi.array().items(Joi.string()),
    createdAt: Joi.date(),
    modifiedAt: Joi.date(),
    scheduledAt: Joi.date(),
    savedDraft: Joi.boolean(),
  });

  return schema.validate(article);
};

exports.Article = Article;
exports.validate = validateArticle;
