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
          $and: [
            { enrollment: enrollment._id },
            { endTime : {$exists: false} }
          ]
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

      if (!latestStory) return next(new NotFound('Story not found'));

      return LearningNode.model.findOne({
        learningPath: enrollment.learningPath,
        _id: latestStory.activity._id
      })
      .select({ __v: 0, tester: 0 })
      .populate('company', { __v: 0 })
      .populate('learningPath', { __v: 0, nodeTree: 0, diagram: 0 })
      .populate('parent', { __v: 0, learningPath: 0 })
      .exec()
      .then(function(activity) {
        return res.status(200).apiResponse(_.assign({}, activity.toObject(), {
          isCompleted: latestStory.isCompleted,
          startTime: latestStory.startTime,
          storyId: latestStory._id
        }));
      });
    })
    .then(null, function(err) {
      return next(err);
    });
}

exports.giveUp = function(req, res, next) {
  Enrollment.model.findOne({
      student: req.user._id,
      isActive: true
    })
    .exec()
    .then(function(enrollment) {
      if (!enrollment)
        return next(new NotFound('Enrollment not found'));
      
      return Story.model.findOne({
          $and: [
            { enrollment: enrollment._id },
            { activity: req.body.activity },
            { endTime : {$exists: false} }
          ]
        })
        .sort({createdAt : -1})
        .exec()
        .then(function(story) {
          if (!story) return next(new NotFound('Story not found'));
          return story;
        });
    })
    .then(function(story) {
      story.endTime = new Date();
      story.save(function(err) {
        if (err) return next(err);
        return res.status(200);
      });
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

      return Story.model.update({
          $and: [
            { enrollment: enrollment._id },
            { endTime : {$exists: false} }
          ]
        },
        { $set : { endTime : new Date() } })
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

exports.start = function(req, res, next) {
  Enrollment.model.findOne({
      student: req.user._id,
      isActive: true
    })
    .exec()
    .then(function(enrollment) {
      if (!enrollment)
        return next(new NotFound('Enrollment not found'));

      return Story.model.findOne({
        enrollment: enrollment._id ,
        activity: req.body.activity
      })
      .sort('-createdAt')
      .exec()
      .then(function(item) {
        if (!item) return next(new NotFound('Story not found'));
        item.startTime = new Date();
        item.save(function(err){
          if(err) return next(err);
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

                console.log(result);
                
                return res.status(200).apiResponse(result);
              });
          });
        });
      });
    })
    .then(null, function(err) {
      return next(err);
    });
}