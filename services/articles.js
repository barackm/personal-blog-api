const { Article } = require('../models/Article');

const createSlug = async (title) => {
  try {
    const slug = title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
    const article = await Article.findOne({ slug: slug });
    if (article) {
      return false;
    }
    return slug;
  } catch (error) {
    console.log(error);
  }
};

const autoSaveArticle = async (articleId, draft, userId) => {
  try {
    const article = await Article.findById(articleId)
      .and({ authorId: userId })
      .exec();
    if (!article) {
      return false;
    }
    article.draft = draft;
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
