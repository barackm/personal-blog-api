const express = require('express');
const contentCreator = require('../middlewares/contentCreator');
const { uploadArticleImage } = require('../services/cloudinary');

const router = express.Router();
const multer = require('multer');
const upload = multer();

const { Article, validate } = require('../models/Article');
const { isUserAuthorOfArticle } = require('../utlis/articles');
const { createSlug } = require('../services/articles');
const { formatError, errorTypes } = require('../utlis/errorHandler');
const { User } = require('../models/User');
const auth = require('../middlewares/auth');
const { default: mongoose } = require('mongoose');
const blogAuthorFieldsToSelect = [
  '-password',
  '-__v',
  '-roles',
  '-status',
  '-verificationToken',
  '-isVerified',
  '-createdAt',
  '-resetPasswordExpires',
  '-resetPasswordToken',
];
router.get('/', [auth], async (req, res) => {
  try {
    const { user } = req;
    const { page, limit } = req.query;
    const articles = await Article.find({
      authorId: user._id,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ modifiedAt: -1 })
      .exec();

    const count = await Article.countDocuments();
    const articlesWithAuthors = await Promise.all(
      articles.map(async (article) => {
        const user = await User.findById(article.authorId).exec();
        return {
          ...article._doc,
          author: user,
        };
      }),
    );

    res.status(200).json({
      articles: articlesWithAuthors,
      total: count,
    });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.get('/blog', async (req, res) => {
  try {
    const articles = await Article.find({ isPublished: true })
      .sort({ modifiedAt: -1 })
      .exec();

    const articlesWithAuthors = await Promise.all(
      articles.map(async (article) => {
        const user = await User.findById(article.authorId)
          .select(blogAuthorFieldsToSelect)
          .exec();
        return {
          ...article._doc,
          author: user,
        };
      }),
    );

    res.status(200).json(articlesWithAuthors);
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

router.get('/slug/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).exec();
    if (!article)
      res
        .status(404)
        .json(formatError('Article not found', errorTypes.notFound));
    if (!article.isPublished) {
      return res
        .status(403)
        .send(formatError('Forbidden', errorTypes.forbidden));
    }
    const user = await User.findById(article.authorId)
      .select(blogAuthorFieldsToSelect)
      .exec();
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

router.put(
  '/save/:id',
  [auth, contentCreator, upload.single('mainImageUrl')],
  async (req, res) => {
    try {
      const { errors } = validate(req.body);
      if (errors) return res.status(400).send(errors.details[0].message);

      let uploadedImage = null;
      const currentUser = req.user;
      const image = req.file;
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

      const { title, draft, tags } = req.body;
      if (image) {
        uploadedImage = await uploadArticleImage(image);
      }

      const modifiedArticle = {
        title,
        draft,
        tags: tags.split(','),
        modifiedAt: Date.now(),
        mainImageUrl: uploadedImage
          ? uploadedImage.secure_url
          : article.mainImageUrl,
      };

      const updatedArticle = await Article.findByIdAndUpdate(
        article._id,
        modifiedArticle,
        { new: true },
      ).exec();

      res.status(200).json({ ...updatedArticle, author: currentUser });
    } catch (error) {
      res.status(500).json(formatError(error.message, errorTypes.serverError));
    }
  },
);

router.put('/publish/:id', [auth, contentCreator], async (req, res) => {
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

    if (article.draft === article.content && article.isPublished) {
      return res
        .status(400)
        .send(formatError('Article already published', errorTypes.validation));
    }

    const newSlug = createSlug;
    const slug = article.slug ? article.slug : newSlug;

    const modifiedArticle = {
      content: article.draft,
      publishedAt: Date.now(),
      isPublished: true,
      scheduledAt: null,
      slug,
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      modifiedArticle,
      { new: true },
    ).exec();

    res.status(200).json({ ...updatedArticle, author: currentUser });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/unpublish/:id', [auth, contentCreator], async (req, res) => {
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

    if (!article.isPublished) {
      return res
        .status(400)
        .send(
          formatError('Article already unpublished', errorTypes.validation),
        );
    }

    const modifiedArticle = {
      publishedAt: null,
      isPublished: false,
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      modifiedArticle,
      { new: true },
    ).exec();

    res.status(200).json({ ...updatedArticle, author: currentUser });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/schedule/:id', [auth, contentCreator], async (req, res) => {
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

    if (article.draft === article.content && article.isPublished) {
      return res
        .status(400)
        .send(formatError('Article already published', errorTypes.validation));
    }

    const { scheduledAt } = req.body;
    const modifiedArticle = {
      content: article.draft,
      scheduledAt,
      isPublished: false,
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      modifiedArticle,
      { new: true },
    ).exec();

    res.status(200).json({ ...updatedArticle, author: currentUser });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

module.exports = router;
