var async = require('async'),
    keystone = require('keystone'),
    util = require('util')
    _ = require('lodash');

var Story = keystone.list('Story'),
    Enrollment = keystone.list('Enrollment'),
    Activity = keystone.list('Activity');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

util.inherits(NotFound, Error);

exports.todayStory = function(req, res, next) {
  Enrollment.model.findOne({
      student: req.user._id,
      isActive: true
    })
    .exec()
    .then(function(enrollment) {
      if (!enrollment)
        return next(new NotFound('Enrollment not found'));

      return Story.model.find({
          enrollment: enrollment._id
        })
        .exec()
        .then(function(stories) {
          return {
            stories: stories,
            enrollment: enrollment
          };
        });
    })
    .then(function(data) {
      var uncompletedStory = _.find(data.stories, 'isCompleted', false),
          completedActivities = _.pluck(data.stories, 'activity');

      if (uncompletedStory) {
        return Activity.model.findOne({
            _id: uncompletedStory.activity
          })
          .select({ __v: 0 })
          .populate('learningPath', { __v: 0 })
          .populate('course', { __v: 0, learningPath: 0 })
          .exec()
          .then(function(story) {
            return _.assign({}, story.toObject(), {
              isCompleted: uncompletedStory.isCompleted,
              startTime: uncompletedStory.startTime,
              storyId: uncompletedStory._id
            })
          });
      } else {
        return Activity.model.findOne({
            _id: { $nin: completedActivities },
            learningPath: data.enrollment.learningPath
          })
          .select({ __v: 0 })
          .populate('learningPath', { __v: 0 })
          .populate('course', { __v: 0, learningPath: 0 })
          .sort('order')
          .exec();
      }
    })
    .then(function(activity) {
      return res.status(200).apiResponse(activity);
    })
    .then(null, function(err) {
      return next(err);
    });
}

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
      item.populate('enrollment', '_id')
        .populate('activity', '_id name estimation', function(err, story) {
          return res.status(200).apiResponse(item);
        });
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