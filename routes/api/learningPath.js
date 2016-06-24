var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var LearningPathModel = keystone.list('LearningPath').model;
var EnrollmentModel = keystone.list('Enrollment').model;

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
      return res.status(200).apiResponse({
        learningPath: item
      });
    }, function(err) {
      return next(err)
    });
}

exports.me = function(req, res, next) {
  EnrollmentModel.findOne({
      $and: [
        { student: req.user._id },
        { isActive: true }
      ]
    })
    .select({ __v: 0 })
    .populate('learningPath', '_id name nodeTree')
    .lean()
    .exec()
    .then(function(enrollments) {
      return res.status(200).apiResponse(enrollments);
    }, function(err) {
      return next(err);
    });
}