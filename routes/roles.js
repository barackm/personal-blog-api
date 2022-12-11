const express = require('express');
const router = express.Router();

const { Role, validate } = require('../models/Role');
const { formatError, errorTypes } = require('../utlis/errorHandler');

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find();
    res.send(roles);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role)
      return res
        .status(404)
        .send(formatError('The role was not found.', errorTypes.notFound));
    res.send(role);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, description, landingPage, label } = req.body;

  try {
    const role = new Role({
      name,
      description,
      landingPage,
      label,
    });
    await role.save();
    res.send(role);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        landingPage: req.body.landingPage,
      },
      { new: true },
    );
    if (!role)
      return res
        .status(404)
        .send(formatError('The role was not found.', errorTypes.notFound));
    res.send(role);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndRemove(req.params.id);
    if (!role)
      return res
        .status(404)
        .send(formatError('The role was not found.', errorTypes.notFound));
    res.send(role);
  } catch (error) {
    res.status(500).json(formatError(error.message, errorTypes.serverError));
  }
});

module.exports = router;
