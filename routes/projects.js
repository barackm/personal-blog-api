const express = require('express');
const router = express.Router();
const { Project, validate } = require('../models/Project');

router.get('/', (req, res) => {
  const projects = Project.find().sort({ createdAt: -1 });
  res.send(projects);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const project = Project.findById(id);
  if (!project)
    return res.status(404).send('The project with the given ID was not found.');
  res.send(project);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const project = new Project({
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    sourceCodeUrl: req.body.sourceCodeUrl,
    liveDemoUrl: req.body.liveDemoUrl,
    technologies: req.body.technologies,
    tags: req.body.tags,
  });
  try {
    await project.save();
    res.send(project);
  } catch (ex) {
    res.status(500).send('Something failed.');
  }
});

module.exports = router;
