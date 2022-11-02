const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const cors = require('cors');
const { publishScheduledArticles } = require('./jobs/articles');

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(
  cors({
    origin: config.get('corsOrigin'),
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('dotenv').config();
require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/cloudinary');
require('./startup/config')();
require('./startup/validation')();
require('./startup/mail')();
// require('./startup/logging')();

const port = process.env.PORT || config.get('port');

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  publishScheduledArticles.start();
});
