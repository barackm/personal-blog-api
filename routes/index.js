const projects = require('./projects');
const home = require('./home');
const roles = require('./roles');

const routes = (app) => {
  app.use('/', home);
  app.use('/api/projects', projects);
  app.use('/api', home);
  app.use('/api/roles', roles);
};

module.exports = routes;
