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

module.exports = {
  createSlug,
};
