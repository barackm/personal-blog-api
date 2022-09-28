const projects = require('../routes/projects');
const home = require('../routes/home');
const roles = require('../routes/roles');
const users = require('../routes/users');

const routes = (app) => {
  app.use('/', home);
  app.use('/api/projects', projects);
  app.use('/api', home);
  app.use('/api/roles', roles);
  app.use('/api/users', users);
};

module.exports = routes;
