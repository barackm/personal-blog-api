const express = require('express');
const auth = require('../middlewares/auth');
const contentCreator = require('../middlewares/contentCreator');
const multer = require('multer');
const upload = multer();

const router = express.Router();

const { Article, validate } = require('../models/Article');
const { createSlug } = require('../services/articles');
const {
  shouldArticleBePublished,
  isUserAuthorOfArticle,
} = require('../utlis/articles');
const { formatError, errorTypes } = require('../utlis/errorHandler');
const { User } = require('../models/User');
const { uploadArticleImage } = require('../services/cloudinary');

router.post(
  '/',
  [auth, contentCreator, upload.single('imageUrl')],
  async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res
          .status(400)
          .send(formatError(error.details[0].message, errorTypes.validation));
      const currentUser = req.user;
      const { title, content, tags, scheduledAt, savedDraft } = req.body;
      const slug = createSlug(title);
      if (!slug) {
        return res
          .status(400)
          .send(
            formatError(
              'Invalid title, no slug genarated',
              errorTypes.validation,
            ),
          );
      }

      const image = req.file;
      let uploadedImage = null;
      if (image) {
        uploadedImage = await uploadArticleImage(image);
      }

      const article = new Article({
        title,
        mainImageUrl: uploadedImage.secure_url || '',
        content,
        tags,
        slug,
        authorId: currentUser._id,
        scheduledAt,
        savedDraft,
        isPublished: shouldArticleBePublished(scheduledAt, savedDraft),
        modifiedAt: Date.now(),
      });

      await article.save();

      res.status(200).json({
        ...article._doc,
        author: currentUser,
      });
    } catch (error) {
      res.status(500).json(formatError(error.message, errorTypes.serverError));
    }
  },
);

router.get('/', async (_, res) => {
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

router.get('/:id', async (req, res) => {
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

router.get('/slug', async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug)
      res.status(400).json(formatError('Invalid slug', errorTypes.validation));
    const article = await Article.findOne({ slug }).exec();
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

router.put(
  '/:id',
  [auth, contentCreator, upload.single('imageUrl')],
  async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res
          .status(400)
          .send(formatError(error.details[0].message, errorTypes.validation));
      const currentUser = req.user;
      if (!isUserAuthorOfArticle(currentUser, article)) {
        return res
          .status(403)
          .send(formatError('Forbidden', errorTypes.forbidden));
      }

      const { title, content, tags, scheduledAt, savedDraft } = req.body;
      let article = await Article.findById(req.params.id).exec();
      if (!article)
        res
          .status(404)
          .json(formatError('Article not found', errorTypes.notFound));

      let slug = article.slug;
      if (title !== article.title) {
        slug = createSlug(title);
        if (!slug) {
          return res
            .status(400)
            .send(
              formatError(
                'Invalid title, no slug genarated',
                errorTypes.validation,
              ),
            );
        }
      }

      const image = req.file;
      let uploadedImage = null;
      if (image) {
        uploadedImage = await uploadArticleImage(image);
      }

      article = {
        ...article._doc,
        title,
        mainImageUrl: image ? uploadedImage.secure_url : article.mainImageUrl,
        content,
        tags,
        slug,
        authorId: currentUser._id,
        scheduledAt,
        savedDraft,
        isPublished: shouldArticleBePublished(scheduledAt, savedDraft),
        modifiedAt: Date.now(),
      };

      await Article.findByIdAndUpdate(req.params.id, article).exec();
      res.status(200).json({
        ...article,
        author: currentUser,
      });
    } catch (error) {
      res.status(500).json(formatError(error.message, errorTypes.serverError));
    }
  },
);

router.delete('/:id', [auth, contentCreator], async (req, res) => {
  try {
    const currentUser = req.user;
    const article = await Article.findById(req.params.id).exec();
    if (!article)
      res
        .status(404)
        .json(formatError('Article not found', errorTypes.notFound));
    if (!isUserAuthorOfArticle(currentUser, article)) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }
    await Article.findByIdAndDelete(req.params.id).exec();
    res.status(200).json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/:id/schedule', [auth, contentCreator], async (req, res) => {
  try {
    const currentUser = req.user;
    const article = await Article.findById(req.params.id).exec();
    if (!article)
      res
        .status(404)
        .json(formatError('Article not found', errorTypes.notFound));
    if (!isUserAuthorOfArticle(currentUser, article)) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }
    const { scheduledAt } = req.body;
    if (!scheduledAt)
      res.status(400).json(formatError('Invalid date', errorTypes.validation));
    article.scheduledAt = scheduledAt;
    article.isPublished = shouldArticleBePublished(
      scheduledAt,
      article.savedDraft,
    );
    await article.save();
    res.status(200).json({ message: 'Article scheduled' });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/:id/publish', [auth, contentCreator], async (req, res) => {
  try {
    const currentUser = req.user;
    const article = await Article.findById(req.params.id).exec();
    if (!article)
      res
        .status(404)
        .json(formatError('Article not found', errorTypes.notFound));
    if (!isUserAuthorOfArticle(currentUser, article)) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }
    article.isPublished = true;
    article.savedDraft = false;
    await article.save();
    res.status(200).json({ message: 'Article published' });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

module.exports = router;
