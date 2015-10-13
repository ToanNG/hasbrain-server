/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var passport = require('passport');
var middleware = require('./middleware');
var auth = require('./auth');
var oauth = require('./oauth');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
  api: importRoutes('./api')
};

// Setup Route Bindings
exports = module.exports = function(app) {
	
	// Views
	app.get('/', routes.views.index);
	app.all('/contact', routes.views.contact);

  // API
  app.post('/oauth/token', oauth.token);
  app.all('/api/*', passport.authenticate('accessToken', { session: false }), keystone.middleware.api);

  app.get('/api/user/list', routes.api.user.list);
  app.get('/api/user/me', routes.api.user.me);

  app.post('/api/story/create', routes.api.story.create);
  app.put('/api/story/:id/complete', routes.api.story.complete);

  app.get('/api/enrollment/:id', routes.api.enrollment.get);
  app.post('/api/enrollment/create', routes.api.enrollment.create);

  // Error Handler
  app.use(function(err, req, res, next) {
    if (err.statusCode === 404) {
      return res.status(404).send({ error: 'Not found', detail: err });
    }

    // If no statusCode, default case is database error.
    return res.status(500).apiError('Database error', err);
  });
	
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
	
};
