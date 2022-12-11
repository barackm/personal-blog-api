const { Article } = require('../models/Article');
const mongoose = require('mongoose');

const createSlug = async (title) => {
  const slug = title.toLowerCase().split(' ').join('-');
  const id = mongoose.Types.ObjectId();
  return `${slug}-${id}`;
};

const autoSaveArticle = async (articleId, { draft, title, tags }, userId) => {
  try {
    const article = await Article.findById(articleId)
      .and({ authorId: userId })
      .exec();
    if (!article) {
      return false;
    }
    article.draft = draft;
    article.title = title;
    article.tags = tags.split(',');
    article.modifiedAt = Date.now();
    await article.save();
    return true;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createSlug,
  autoSaveArticle,
};
