const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

const routes = require('./routes');
routes(app);

mongoose
  .connect('mongodb://localhost:27017/myPortfolio')
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...'));

const port = process.env.PORT || 5050;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
