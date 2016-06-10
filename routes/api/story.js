var async = require('async'),
    keystone = require('keystone'),
    util = require('util')
    _ = require('lodash');

var Story = keystone.list('Story'),
    Enrollment = keystone.list('Enrollment'),
    LearningNode = keystone.list('LearningNode');

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

      return Story.model.findOne({
          enrollment: enrollment._id
        })
        .sort('-createdAt')
        .populate('activity', '_id no')
        .exec()
        .then(function(latestStory) {
          return {
            latestStory: latestStory,
            enrollment: enrollment
          };
        });
    })
    .then(function(data) {
      var latestStory = data.latestStory,
          enrollment = data.enrollment;

      if (!latestStory) {
        return LearningNode.model.findOne({
            learningPath: enrollment.learningPath,
            nodeType: 'activity'
          })
          .sort('no')
          .select({ __v: 0, tester: 0 })
          .populate('company', { __v: 0 })
          .populate('learningPath', { __v: 0, nodeTree: 0, diagram: 0 })
          .populate('parent', { __v: 0, learningPath: 0 })
          .exec();
      }

      if (!latestStory.isCompleted) {
        return LearningNode.model.findOne({
            _id: latestStory.activity._id
          })
          .select({ __v: 0, tester: 0 })
          .populate('company', { __v: 0 })
          .populate('learningPath', { __v: 0, nodeTree: 0, diagram: 0 })
          .populate('parent', { __v: 0, learningPath: 0 })
          .exec()
          .then(function(activity) {
            return _.assign({}, activity.toObject(), {
              isCompleted: latestStory.isCompleted,
              startTime: latestStory.startTime,
              storyId: latestStory._id
            })
          });
      } else {
        return LearningNode.model.findOne({
            no: { $gt: latestStory.activity.no }
          })
          .sort('no')
          .select({ __v: 0, tester: 0 })
          .populate('company', { __v: 0 })
          .populate('learningPath', { __v: 0, nodeTree: 0, diagram: 0 })
          .populate('parent', { __v: 0, learningPath: 0 })
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
          .populate('learningPath', { __v: 0, nodeTree: 0, diagram: 0 })
          .populate('parent', { __v: 0, learningPath: 0 }, function(err, activity) {
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

exports.completeStory = function(req, res, next){
  Enrollment.model.findOne({
    student: req.user._id,
    isActive: true
  })
  .exec()
  .then(function(enrollment){
    if(!enrollment){
      return next(new NotFound('Enrollment not found'));
    }

    return Story.model.find({
      enrollment: enrollment._id,
      isCompleted: true
    })
    .sort('-createdAt')
    .populate('activity', '_id no')
    .exec();
  })
  .then(function(stories){
    return res.status(200).apiResponse(stories);
  })
  .then(null, function(err){
    return next(err);
  });
}