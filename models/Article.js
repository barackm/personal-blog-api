const mongoose = require('mongoose');
const Joi = require('joi');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 5,
    maxlength: 255,
    required: true,
  },

  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  mainImageUrl: {
    type: String,
  },

  slug: {
    type: String,
    maxlength: 255,
    unique: true,
  },
  content: {
    type: String,
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
  draft: {
    type: String,
  },
  publishedAt: {
    type: Date,
  },
});

const Article = mongoose.model('Article', articleSchema);

const validateArticle = (article) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    mainImageUrl: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    draft: Joi.string().min(5).required(),
  });

  return schema.validate(article);
};

exports.Article = Article;
exports.validate = validateArticle;
