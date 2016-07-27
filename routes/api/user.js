var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash'),
    pubnub = require('pubnub')({
      publish_key: 'pub-c-8807fd6d-6f87-486f-9fd6-5869bc37e93a',
      subscribe_key: 'sub-c-861f96a2-3c20-11e6-9236-02ee2ddab7fe',
    });
    /*
    pubnub.publish({ 
      channel: 'hasbrain_test_' + req.user._id,
      message: { text: 'Test subcribe pubnub' }
    });
    */

var UserModel = keystone.list('User').model,
    EnrollmentModel = keystone.list('Enrollment').model;

exports.list = function(req, res, next) {
  UserModel.find({ isAdmin: false })
    .select({ __v: 0, password: 0, isAdmin: 0 })
    .exec()
    .then(function(items) {
      return res.status(200).apiResponse({
        users: items
      });
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
    .populate('learningPath', '_id name nodeTree')
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

exports.levelTips = function(req, res, next) {
  UserModel.findOne({ _id: req.user._id }, function (err, user){
    user.levelTips = req.body.levelTips
    user.save(function(err){
      if(err) return next(err);
      return res.status(200).apiResponse(user);
    });
  });
}