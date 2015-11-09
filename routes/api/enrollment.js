var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var Enrollment = keystone.list('Enrollment'),
    Course = keystone.list('Course'),
    Story = keystone.list('Story'),
    Activity = keystone.list('Activity');

exports.listStory = function(req, res, next) {
  Story.model.find({ enrollment: req.params.id })
    .select({ __v: 0, enrollment: 0 })
    .populate('activity', '_id name estimation')
    .exec()
    .then(function(items) {
      return res.status(200).apiResponse({
        stories: items
      });
    }, function(err) {
      return next(err)
    });
}

exports.listActivity = function(req, res, next) {
  Enrollment.model.findById(req.params.id)
    .populate('learningPath')
    .exec()
    .then(function(enrollment) {
      return Activity.model.find({ learningPath: enrollment.learningPath._id })
        .select({ __v: 0 })
        .populate('learningPath', { __v: 0 })
        .populate('course', { __v: 0, learningPath: 0 })
        .exec();
    })
    .then(function(activities) {
      return res.status(200).apiResponse(activities);
    })
    .then(null, function(err) {
      return next(err);
    });
}

exports.create = function(req, res, next) {
  var item = new Enrollment.model({ student: req.user });

  item.getUpdateHandler(req).process({ learningPath: req.body.learning_path }, function(err) {
    if (err) return next(err);
    
    return res.status(200).apiResponse(item);
  });
}