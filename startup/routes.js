const projects = require('../routes/projects');
const home = require('../routes/home');
const roles = require('../routes/roles');
const users = require('../routes/users');
const articles = require('../routes/articles');
const auth = require('../routes/auth');
const projectCategories = require('../routes/projectCategories');

const routes = (app) => {
  app.use('/', home);
  app.use('/api', home);
  app.use('/api/projects', projects);
  app.use('/api/roles', roles);
  app.use('/api/users', users);
  app.use('/api/articles', articles);
  app.use('/api/auth', auth);
  app.use('/api/projectCategories', projectCategories);
};

module.exports = routes;
