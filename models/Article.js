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
});

const Article = mongoose.model('Article', articleSchema);

const validateArticle = (article) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255),
    authorId: Joi.string(),
    mainImageUrl: Joi.string(),
    content: Joi.string().min(5),
    tags: Joi.array().items(Joi.string()),
    createdAt: Joi.date(),
    modifiedAt: Joi.date(),
    scheduledAt: Joi.date(),
    isPublished: Joi.boolean(),
    draft: Joi.string().min(5),
  });

  return schema.validate(article);
};

exports.Article = Article;
exports.validate = validateArticle;
