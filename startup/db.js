const mongoose = require('mongoose');
const { DB } = require('../utlis/constants');

module.exports = function () {
  const db = DB.URL;
  mongoose
    .connect(db)
    .then(() => console.log(`Connected to ${db}...`))
    .catch(() => console.error('Could not connect to MongoDB...'));
};
