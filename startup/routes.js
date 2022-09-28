const projects = require('../routes/projects');
const home = require('../routes/home');
const roles = require('../routes/roles');

const routes = (app) => {
  app.use('/', home);
  app.use('/api/projects', projects);
  app.use('/api', home);
  app.use('/api/roles', roles);
};

module.exports = routes;
