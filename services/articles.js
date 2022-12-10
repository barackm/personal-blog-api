const { Article } = require('../models/Article');

const createSlug = async (title) => {
  try {
    const slug = title.toLowerCase().split(' ').join('-');
    const article = await Article.findOne(
      { slug: new RegExp(`^${slug}(-[0-9]*)?$`) },
      'slug',
      { sort: { slug: -1 } },
    ).exec();
    if (!article) {
      return slug;
    }
    const lastSlug = article.slug.split('-').pop();
    if (isNaN(lastSlug)) {
      return `${slug}-1`;
    }
    return `${slug.slice(0, -lastSlug.length)}${parseInt(lastSlug, 10) + 1}`;
  } catch (error) {
    throw new Error(error);
  }
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
