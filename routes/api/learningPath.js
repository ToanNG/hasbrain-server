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

exports.get = function(req, res, next) {
  LearningPathModel.findById(req.params.id)
    .lean()
    .exec()
    .then(function(item) {
      item.nodeTree = JSON.parse(item.nodeTree);
      return res.status(200).apiResponse(item);
    }, function(err) {
      return next(err)
    });
}
