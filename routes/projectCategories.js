const express = require('express');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const router = express.Router();

const {
  ProjectCategory,
  validateProjectCategory,
} = require('../models/ProjectCategory');

router.get('/', async (req, res) => {
  try {
    const projectCategories = await ProjectCategory.find().exec();
    res.status(200).json(projectCategories);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const projectCategory = await ProjectCategory.findById(
      req.params.id,
    ).exec();
    res.status(200).json(projectCategory);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const { error } = validateProjectCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { name, description } = req.body;
    const projectCategory = new ProjectCategory({
      name,
      description,
    });
    await projectCategory.save();
    res.status(200).json(projectCategory);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { error } = validateProjectCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { name } = req.body;
    const projectCategory = await ProjectCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
      },
      { new: true },
    );
    res.status(200).json(projectCategory);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const projectCategory = await ProjectCategory.findByIdAndDelete(
      req.params.id,
    );
    res.status(200).json(projectCategory);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
