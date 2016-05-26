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

exports.me = function(req, res, next) {
  EnrollmentModel.find({
      $and: [
        { student: req.user._id },
        { isActive: true }
      ]
    })
    .select({ __v: 0 })
    .populate('student', { __v: 0, password: 0, isAdmin: 0, isSuperAdmin: 0 })
    .populate('learningPath', '_id name')
    .limit(1)
    .lean()
    .exec()
    .then(function(enrollments) {
      if (!enrollments.length)
        return res.status(200).apiResponse(_.omit(req.user.toObject(), ['__v', 'password', 'isAdmin']));

      var cleanedEnrollments = _.invokeMap(enrollments, function() { return _.omit(this, 'student') });
      var data = _.assign({}, enrollments[0].student, { enrollments: cleanedEnrollments });
      return res.status(200).apiResponse(data);
    }, function(err) {
      return next(err);
    });
}