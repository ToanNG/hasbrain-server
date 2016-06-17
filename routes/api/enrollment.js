var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var Enrollment = keystone.list('Enrollment')
    Story = keystone.list('Story'),
    LearningNode = keystone.list('LearningNode');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

exports.listStory = function(req, res, next) {
  var isCompleted = req.query.is_completed,
      queries = {};
  if (isCompleted) {
    queries.isCompleted = isCompleted === 'true';
  }
  Story.model.find({ enrollment: req.params.id })
    .where(queries)
    .select({ __v: 0 })
    .populate('enrollment', '_id')
    .populate('activity', '_id name estimation')
    .exec()
    .then(function(stories) {
      return res.status(200).apiResponse(stories);
    }, function(err) {
      return next(err)
    });
}

exports.listActivity = function(req, res, next) {
  Enrollment.model.findById(req.params.id)
    .populate('learningPath')
    .exec()
    .then(function(enrollment) {
      return LearningNode.model.find({
          learningPath: enrollment.learningPath._id,
          nodeType: 'activity'
        })
        .select({ __v: 0 })
        .populate('learningPath', { __v: 0 })
        .populate('parent', { __v: 0, learningPath: 0 })
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
  var enrollment = Enrollment.model.create({
    student: req.user,
    learningPath: req.body.learning_path,
    isActive: true
  });

  enrollment.then(function(enrollment) {
    // CHECK and GET learning node
    if(req.body.learning_node) {
      return  LearningNode.model.findById(req.body.learning_node)
        .exec()
        .then(function(node) {
          if(!node) return next(new NotFound('Learning node not found'));

          return { activity : node, enrollment : enrollment };
        });
    } else {
      // GET suitable node to learn
      return LearningNode.model.findOne({
          learningPath: enrollment.learningPath,
          nodeType: 'activity'
        })
        .sort('no')
        .exec()
        .then(function(node){
          if(!node) return next(new NotFound('Learning node not found'));

          return { activity : node, enrollment : enrollment };
        });
    }
  })
  .then(function(item){
    if(item.activity.nodeType === 'activity') {
      return item;
    } else {
      return LearningNode.model.findOne({
          learningPath: item.enrollment.learningPath,
          nodeType: 'activity',
          parent: item.activity._id
        })
        .sort('no')
        .exec()
        .then(function(node){
          if(!node) return next(new NotFound('Learning node not found'));

          return { activity : node, enrollment : item.enrollment };
        });
    }
  })
  .then(function(item){
    return Story.model.create({
      enrollment: item.enrollment._id,
      activity: item.activity._id
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
  .then(null, function(err){
    return next(err);
  });
}