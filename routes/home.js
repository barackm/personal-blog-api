const express = require('express');
const router = express.Router();
const config = require('config');

router.get('/', (_, res) => {
  res.send(`Hey there, welcome to ${config.get('name')}!`);
});

module.exports = router;
