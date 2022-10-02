const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// require('./startup/logging')();
require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const port = process.env.PORT || config.get('port');

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
