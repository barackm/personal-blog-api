const projects = require('../routes/projects');
const home = require('../routes/home');
const roles = require('../routes/roles');
const users = require('../routes/users');
const articles = require('../routes/articles');

const routes = (app) => {
  app.use('/', home);
  app.use('/api', home);
  app.use('/api/projects', projects);
  app.use('/api/roles', roles);
  app.use('/api/users', users);
  app.use('/api/articles', articles);
};

module.exports = routes;
