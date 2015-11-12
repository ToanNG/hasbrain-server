var async = require('async'),
    keystone = require('keystone'),
    util = require('util');

var Story = keystone.list('Story');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

util.inherits(NotFound, Error);

exports.create = function(req, res, next) {
  Story.model.find({
      $and: [
        { enrollment: req.body.enrollment },
        { isCompleted: false }
      ]
    })
    .remove()
    .exec()
    .then(function() {
      return Story.model.create({
        enrollment: req.body.enrollment,
        activity: req.body.activity
      });
    })
    .then(function(item) {
      return res.status(200).apiResponse(item);
    })
    .then(null, function(err) {
      return next(err);
    });
}

exports.complete = function(req, res, next) {
  Story.model.findById(req.params.id).exec(function(err, item) {
    if (err) return next(err);
    if (!item) return next(new NotFound('Story not found'));
    
    item.getUpdateHandler(req).process({ isCompleted: true }, function(err) {
      if (err) return next(err);
      
      return res.status(200).apiResponse(item);
    });
  });
}