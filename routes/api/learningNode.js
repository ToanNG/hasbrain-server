var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var LearningNodeModel = keystone.list('LearningNode').model;

exports.list = function(req, res, next) {
  LearningNodeModel.find()
    .exec()
    .then(function(items) {
      return res.status(200).apiResponse({
        learningNodes: items
      });
    }, function(err) {
      return next(err)
    });
}
