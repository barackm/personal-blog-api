const express = require('express');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const router = express.Router();
const { uploadProjectImage } = require('../services/cloudinary');
const multer = require('multer');
const upload = multer();
const { Project, validate } = require('../models/Project');
const { ProjectCategory } = require('../models/ProjectCategory');
const { formatError, errorTypes } = require('../utlis/errorHandler');

router.get('/', async (_, res) => {
  try {
    const projects = await Project.find().exec();
    const projectsWithCategories = await Promise.all(
      projects.map(async (project) => {
        const category = await ProjectCategory.findById(
          project.categoryId,
        ).exec();
        return {
          ...project._doc,
          category,
        };
      }),
    );
    res.status(200).json(projectsWithCategories);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.get('/:id', [auth, admin], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).exec();
    const category = await ProjectCategory.findById(project.categoryId).exec();
    res.status(200).json({ ...project._doc, category });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/', [auth, admin, upload.single('imageUrl')], async (req, res) => {
  try {
    req.body.tags = req.body.tags.split(',');
    req.body.technologies = req.body.technologies.split(',');

    const { error } = validate(req.body);
    const image = req.file;
    if (error)
      return res
        .status(400)
        .json(formatError(error.details[0].message, errorTypes.validation));
    let uploadedImage = null;
    const category = await ProjectCategory.findById(req.body.categoryId).exec();
    if (!category)
      return res
        .status(400)
        .json(formatError('Invalid project category.', errorTypes.validation));

    if (image) {
      uploadedImage = await uploadProjectImage(image);
    }

    const project = new Project({
      ...req.body,
      imageUrl: uploadedImage ? uploadedImage.secure_url : req.body.imageUrl,
    });

    await project.save();
    res.status(200).json({ ...project._doc, category: category });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.put(
  '/:id',
  [auth, admin, upload.single('imageUrl')],
  async (req, res) => {
    try {
      req.body.tags = req.body.tags.split(',');
      req.body.technologies = req.body.technologies.split(',');

      const { error } = validate(req.body);
      const image = req.file;
      if (error)
        return res
          .status(400)
          .json(formatError(error.details[0].message, errorTypes.validation));
      let uploadedImage = null;
      const category = await ProjectCategory.findById(
        req.body.categoryId,
      ).exec();
      if (!category)
        return res
          .status(400)
          .json(
            formatError('Invalid project category.', errorTypes.validation),
          );

      if (image) {
        uploadedImage = await uploadProjectImage(image);
      }

      const project = await Project.findById(req.params.id).exec();
      project.set({
        ...req.body,
        imageUrl: uploadedImage ? uploadedImage.secure_url : project.imageUrl,
      });
      await project.save();
      res.status(200).json({ ...project._doc, category: category });
    } catch (error) {
      res.status(500).json(formatError(error.message, errorTypes.serverError));
    }
  },
);

router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id).exec();
    const category = await ProjectCategory.findById(project.categoryId).exec();
    res.status(200).json({ ...project._doc, category: category });
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

module.exports = router;
