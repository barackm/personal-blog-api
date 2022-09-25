const projects = require('./projects');
const home = require('./home');

const routes = (app) => {
  app.use('/', home);
  app.use('/api/projects', projects);
  app.use('/api', home);
};

module.exports = routes;
