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
          .select({ __v: 0, tester: 0 })
          .populate('company', { __v: 0 })
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
          .populate('company', { __v: 0 })
          .populate('learningPath', { __v: 0 })
          .populate('course', { __v: 0, learningPath: 0 })
          .sort('no')
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
  Enrollment.model.findOne({
      student: req.user._id,
      isActive: true
    })
    .exec()
    .then(function(enrollment) {
      if (!enrollment)
        return next(new NotFound('Enrollment not found'));

      return Story.model.find({
          $and: [
            { enrollment: enrollment._id },
            { isCompleted: false }
          ]
        })
        .remove()
        .exec()
        .then(function() {
          return enrollment;
        });
    })
    .then(function(enrollment) {
      return Story.model.create({
        enrollment: enrollment._id,
        activity: req.body.activity
      });
    })
    .then(function(item) {
      item.populate('activity', function(err, story) {
        story.activity
          .populate('company', { __v: 0 })
          .populate('learningPath', { __v: 0 })
          .populate('course', { __v: 0, learningPath: 0 }, function(err, activity) {
            var result = _.assign({}, activity.toObject({ versionKey: false }), {
              isCompleted: story.isCompleted,
              startTime: story.startTime,
              storyId: story._id
            })
            
            return res.status(200).apiResponse(result);
          });
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