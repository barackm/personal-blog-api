const express = require('express');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const router = express.Router();
const { Project, validate } = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).exec();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).exec();
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = new Project(req.body);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id).exec();
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
