var cron = require('node-cron');
const { Article } = require('../models/Article');

const publishScheduledArticles = cron.schedule('*/5 * * * *', async () => {
  try {
    const articles = await Article.find({
      scheduledAt: { $lte: new Date() },
    })
      .and({ isPublished: false })
      .exec();

    articles.forEach(async (article) => {
      article.isPublished = true;
      await article.save();
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  publishScheduledArticles,
};
