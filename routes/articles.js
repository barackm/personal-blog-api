const express = require('express');
const contentCreator = require('../middlewares/contentCreator');

const router = express.Router();

const { Article } = require('../models/Article');
const { isUserAuthorOfArticle } = require('../utlis/articles');
const { formatError, errorTypes } = require('../utlis/errorHandler');
const { User } = require('../models/User');
const auth = require('../middlewares/auth');
const { default: mongoose } = require('mongoose');

router.get('/', [auth], async (_, res) => {
  try {
    const articles = await Article.find().exec();

    const articlesWithOthers = await Promise.all(
      articles.map(async (article) => {
        const user = await User.findById(article.authorId).exec();
        return {
          ...article._doc,
          author: user,
        };
      }),
    );
    res.status(200).json(articlesWithOthers);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/new-article', [auth, contentCreator], async (req, res) => {
  try {
    const user = req.user;

    const article = new Article({
      content: '',
      modifiedAt: Date.now(),
      draft: '',
      title: 'Draft: Untitled',
      authorId: user._id,
      slug: mongoose.Types.ObjectId().toString(),
    });

    await article.save();
    res.send({
      ...article._doc,
      isNewArticle: true,
    });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.get('/:id', [auth], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).exec();
    if (!article)
      res
        .status(404)
        .json(formatError('Article not found', errorTypes.notFound));
    const user = await User.findById(article.authorId).exec();
    res.status(200).json({ ...article._doc, author: user });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.delete('/:id', [auth, contentCreator], async (req, res) => {
  try {
    const currentUser = req.user;
    const article = await Article.findById(req.params.id).exec();

    if (!article)
      res
        .status(404)
        .json(formatError('Article not found', errorTypes.notFound));
    if (!isUserAuthorOfArticle(article, currentUser)) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }

    await Article.findByIdAndDelete(article._id).exec();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

module.exports = router;
