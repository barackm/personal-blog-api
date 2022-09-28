const mongoose = require('mongoose');

module.exports = function () {
  const db = 'mongodb://localhost/myPortfolio';
  mongoose
    .connect(db)
    .then(() => console.log(`Connected to ${db}...`))
    .catch((err) => console.error('Could not connect to MongoDB...'));
};
