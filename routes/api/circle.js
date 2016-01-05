var async = require('async'),
    keystone = require('keystone'),
    util = require('util'),
    request = require('superagent');

var Story = keystone.list('Story');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

util.inherits(NotFound, Error);

exports.build = function(req, res, next) {
  request
    .post(req.body.build_api)
    .send({
      build_parameters: req.body.build_parameters
    })
    .set('Content-Type', 'application/json')
    .end(function(err, data) {
      if (err) return next(err);
      return res.status(200).send();
    });
}

exports.completeStory = function(req, res, next) {
  var payload = req.body.payload;

  if (payload.failed) {
    return next(new Error('Test failed'));
  }

  Story.model.findById(payload.build_parameters.STORY_ID).exec(function(err, item) {
    if (err) return next(err);
    if (!item) return next(new NotFound('Story not found'));
    
    item.getUpdateHandler(req).process({ isCompleted: true }, function(err) {
      if (err) return next(err);
      
      return res.status(200).apiResponse(item);
    });
  });
}