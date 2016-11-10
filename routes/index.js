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
var cors = require('cors');
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
  
  // Cors
  app.use(cors());

  // Views
  app.get('/', routes.views.index);
  app.all('/contact', routes.views.contact);
  app.get('/teacher', middleware.requireUser, routes.views.teacher);

  // API
  app.use(keystone.middleware.api);
  app.post('/oauth/token', oauth.token);
  app.get('/github/callback', routes.api.github.callback);
  app.post('/github/exchange-token', routes.api.github.exchangeToken);
  app.get('/coggle/callback', routes.api.coggle.callback);
  app.get('/coggle/draw-tree', routes.api.coggle.drawTree);
  app.all('/api/*', passport.authenticate('accessToken', { session: false }));

  app.get('/api/user/list', routes.api.user.list);
  app.get('/api/user/me', routes.api.user.me);
  app.post('/api/user/leveltips', routes.api.user.levelTips);

  app.get('/api/story/today', routes.api.story.todayStory);
  app.post('/api/story/create', routes.api.story.create);
  app.post('/api/story/:id/complete', routes.api.story.complete);
  app.get('/api/story/complete', routes.api.story.completeStory);
  app.post('/api/story/giveup', routes.api.story.giveUp);
  app.post('/api/story/start', routes.api.story.start);
  app.post('/api/story/show-knowledge', routes.api.story.showKnowledge);
  app.get('/api/story/set-complete/:id', routes.api.circle.setCompleteStory);

  app.post('/api/story/add-working-time/:id', routes.api.story.addWorkingTime);

  app.get('/api/enrollment/:id/activity/list', routes.api.enrollment.listActivity);
  app.get('/api/enrollment/:id/story/list', routes.api.enrollment.listStory);
  app.post('/api/enrollment/create', routes.api.enrollment.create);

  app.post('/hook/circle/complete-story', routes.api.circle.completeStory);

  app.post('/api/circle/build', routes.api.circle.build);

  app.get('/api/learning-path/list', routes.api.learningPath.list);
  app.get('/api/learning-path/me', routes.api.learningPath.me);
  //app.get('/api/learning-path/:id', routes.api.learningPath.get);

  app.get('/api/learning-node/list', routes.api.learningNode.list);
  app.get('/api/learning-node/today', routes.api.learningNode.getTodayLearningNode);
  app.get('/api/learning-node/today/:learningNode', routes.api.learningNode.getTodayLearningNode);

  app.get('/api/pairing/me', routes.api.pairing.getPartner);
  // app.get('/api/quiz/:id', routes.api.quiz.get);

  // Error Handler
  app.use(function(err, req, res, next) {
    if (err.statusCode === 404) {
      return res.status(404).send({ error: 'Not found', detail: err.message });
    }

    // If no statusCode, default case is database error.
    return res.status(500).apiError('Database error', err.message);
  });
  
  // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
  // app.get('/protected', middleware.requireUser, routes.views.protected);
  
};
