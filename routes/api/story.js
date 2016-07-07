var async = require('async'),
    keystone = require('keystone'),
    util = require('util')
    _ = require('lodash'),
    pubnub = require('pubnub')({
      publish_key: 'pub-c-8807fd6d-6f87-486f-9fd6-5869bc37e93a',
      subscribe_key: 'sub-c-861f96a2-3c20-11e6-9236-02ee2ddab7fe',
    });

var Story = keystone.list('Story'),
    Enrollment = keystone.list('Enrollment'),
    LearningNode = keystone.list('LearningNode'),
    Pairing = keystone.list('Pairing');

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
          $or : [
            {
              enrollment: enrollment._id,
              isCompleted : true
            },
            {
              enrollment: enrollment._id,
              endTime : {$exists: false}
            }
          ]
        })
        .sort('-createdAt')
        .populate('activity', '_id no')
        .exec()
        .then(function(latestStory) {
          if (!latestStory) return next(new NotFound('Story not found'));
          
          if(latestStory.isCompleted) {
            return Pairing.model.findOne({
              $and : [
                {learningPath : enrollment.learningPath},
                {$or:[ {studentA: req.user._id}, {studentB: req.user._id} ]}
              ]
            })
            .sort('-createdAt')
            .populate('studentA', '_id name')
            .populate('studentB', '_id name')
            .exec()
            .then(function(partner){
              if(!partner) return next(new NotFound('Buddy not found'));

              const buddy = (req.user._id.equals(partner.studentA._id)) ? partner.studentB : partner.studentA;
              
              return Enrollment.model.findOne({
                student: buddy._id,
                isActive: true
              })
              .exec()
              .then(function(bEnrollment) {
                if (!bEnrollment) return next(new NotFound('Enrollment of buddy not found'));
                return {
                  bEnrollment : bEnrollment,
                  activity : latestStory.activity._id
                };
              })
              .then(function(data){
                return Story.model.findOne({
                  enrollment : data.bEnrollment._id,
                  activity : data.activity,
                  isCompleted : true
                })
                .sort('-createdAt')
                .exec()
                .then(function(bStory){
                  if(!bStory) {
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
                        storyId: latestStory._id,
                        buddyCompleted : false
                      }));
                    });
                  } else {
                    return res.status(404);
                  }
                });
              });
            });
          } else {
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
                storyId: latestStory._id,
                buddyCompleted : true
              }));
            });
          }
          
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

      return Story.model.findOne({
        enrollment: enrollment._id,
        activity: req.body.activity,
        isCompleted : true
      })
      .exec()
      .then(function(story){
        if(story) {
          pubnub.publish({ 
            channel: 'hasbrain_test_' + req.user._id,
            message: { text: 'You have finished this activity before!' }
          });
          return next(new NotFound('Story was finished'));
        } else {
          return Story.model.update({
            $and: [
              { enrollment: enrollment._id },
              { endTime : {$exists: false} }
            ]
          },
          { $set : { endTime : new Date() } })
          .exec()
          .then(function() {
            return LearningNode.model.findOne({
              _id : req.body.activity,
              nodeType : 'activity'
            })
            .exec()
            .then(function(activity){
              if(!activity) return next(new NotFound('Acitivity was not found or not valid!'));
              return Story.model.create({
                enrollment: enrollment._id,
                activity: activity._id
              });
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
          });
        }
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

        // Check if you have buddy or not
        Pairing.model.findOne({
          $and : [
            {learningPath : enrollment.learningPath},
            {$or:[ {studentA: req.user._id}, {studentB: req.user._id} ]}
          ]
        })
        .sort('-createdAt')
        .populate('studentA', '_id name')
        .populate('studentB', '_id name')
        .exec()
        .then(function(partner){
          var flag = false;
          if(partner) {
            const buddy = (req.user._id.equals(partner.studentA._id)) ? partner.studentB : partner.studentA;

            return Enrollment.model.findOne({
              student : buddy._id,
              learningPath : enrollment.learningPath,
              isActive : true
            })
            .exec()
            .then(function(bEnrollment){
              if(!bEnrollment) return next(new NotFound('Enrollment of buddy not found'));
              return Story.model.findOne({
                enrollment : bEnrollment._id,
                activity: req.body.activity
              })
              .exec()
              .then(function(bStory){
                if(!bStory) {
                  pubnub.publish({ 
                    channel: 'hasbrain_test_' + req.user._id,
                    message: { text: 'In order to start this activity, you and your buddy must participate!' }
                  });
                  return next(new NotFound('Story of buddy not found'));
                } else {
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
                          });
                          
                          return res.status(200).apiResponse(result);
                        });
                    });
                  });
                }
              });
            });
          } else {
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
                    });
                    
                    return res.status(200).apiResponse(result);
                  });
              });
            });
          }
        });
      });
    })
    .then(null, function(err) {
      return next(err);
    });
}