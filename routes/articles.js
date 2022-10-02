const express = require('express');
const auth = require('../middlewares/auth');
const contentCreator = require('../middlewares/contentCreator');
const router = express.Router();

const { Article, validate } = require('../models/Article');
const { createSlug } = require('../services/articles');
const {
  shouldArticleBePublished,
  isUserAuthorOfArticle,
} = require('../utlis/articles');

router.get('/', async (req, res) => {
  const { page, limit, sort, order } = req.query;
  try {
    const articles = await Article.find()
      .sort({ [sort]: order })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).exec();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).exec();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/', [contentCreator], async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { title, mainImageUrl, content, tags, scheduledAt, savedDraft } =
      req.body;
    const { user } = req;
    const slug = await createSlug(title);
    if (!slug) return res.status(400).send('Title already exists');

    const article = new Article({
      title,
      mainImageUrl,
      slug,
      content,
      tags,
      authorId: user._id,
      createdAt: new Date(),
      modifiedAt: new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isPublished: shouldArticleBePublished({ scheduledAt, savedDraft }),
      savedDraft: savedDraft ? savedDraft : false,
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/:id', [auth, contentCreator], async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { title, mainImageUrl, content, tags, scheduledAt, savedDraft } =
      req.body;
    const { user } = req;
    const article = await Article.findById(req.params.id).exec();

    if (!article) return res.status(404).send('Article not found');
    if (!isUserAuthorOfArticle(req.user, article))
      return res.status(403).send('You are not the author of this article');

    if (article.title !== title) {
      const slug = await createSlug(title);
      if (!slug) return res.status(400).send('Title already exists');
      article.slug = slug;
    }

    if (article.authorId.toString() !== user._id.toString() && !user.isAdmin)
      return res.status(403).send('You are not the author of this article');

    if (scheduledAt && new Date(scheduledAt) < new Date())
      return res.status(400).send('Scheduled date must be in the future');

    article.title = title;
    article.mainImageUrl = mainImageUrl;
    article.content = content;
    article.tags = tags;
    article.modifiedAt = new Date();
    article.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    article.isPublished = shouldArticleBePublished({ scheduledAt, savedDraft });
    article.savedDraft = savedDraft;

    await article.save();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/:id', [auth, contentCreator], async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id).exec();

    if (!article) return res.status(404).send('Article not found');
    if (!isUserAuthorOfArticle(req.user, article))
      return res.status(403).send('You are not the author of this article');

    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/publish/:id', [auth, contentCreator], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).exec();

    if (!article) return res.status(404).send('Article not found');
    if (!isUserAuthorOfArticle(req.user, article))
      return res.status(403).send('You are not the author of this article');

    article.isPublished = true;
    article.savedDraft = false;
    await article.save();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/unpublish/:id', [auth, contentCreator], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).exec();

    if (!article) return res.status(404).send('Article not found');
    if (!isUserAuthorOfArticle(req.user, article))
      return res.status(403).send('You are not the author of this article');

    article.isPublished = false;
    article.savedDraft = true;
    await article.save();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/save-draft/:id', [auth, contentCreator], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).exec();
    if (!article) return res.status(404).send('Article not found');
    if (!isUserAuthorOfArticle(req.user, article))
      return res.status(403).send('You are not the author of this article');

    article.savedDraft = true;
    article.isPublished = false;
    await article.save();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/reschedule/:id', [auth, contentCreator], async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt || new Date(scheduledAt) < new Date())
      return res.status(400).send('Scheduled date must be in the future');
    const article = await Article.findById(req.params.id).exec();

    if (!article) return res.status(404).send('Article not found');
    if (!isUserAuthorOfArticle(req.user, article))
      return res.status(403).send('You are not the author of this article');

    article.scheduledAt = new Date(req.body.scheduledAt);
    article.isPublished = false;
    article.savedDraft = true;
    await article.save();
    res.status(200).json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
