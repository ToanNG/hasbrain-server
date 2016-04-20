var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var LearningPathModel = keystone.list('LearningPath').model;

exports.list = function(req, res, next) {
  LearningPathModel.find()
    .exec()
    .then(function(items) {
      return res.status(200).apiResponse({
        learningPaths: items
      });
    }, function(err) {
      return next(err)
    });
}
