const express = require('express');
const router = express.Router();

const { Role, validate } = require('../models/Role');

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find();
    res.send(roles);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role)
      return res.status(404).send('The role with the given ID was not found.');
    res.send(role);
  } catch (error) {
    res.status(500).send(error.message);
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
    res.status(500).send(error.message);
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
      return res.status(404).send('The role with the given ID was not found.');
    res.send(role);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndRemove(req.params.id);
    if (!role)
      return res.status(404).send('The role with the given ID was not found.');
    res.send(role);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
