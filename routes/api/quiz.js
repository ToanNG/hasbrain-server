var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var Quiz = keystone.list('Quiz'),
    LearningNode = keystone.list('LearningNode');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

exports.get = function(req, res, next){
  var id = req.params.id;
  if(id) {
    LearningNode.model.findOne({
      _id: id,
      nodeType: 'activity'
    })
    .exec()
    .then(function(node){
      if (!node) return next(new NotFound('Learning Node not found'));

      Quiz.model.find({
        _id: { $in: node.quiz }
      })
      .exec()
      .then(function(quiz){
        if (!quiz) return next(new NotFound('Quiz not found'));
        
        return res.status(200).apiResponse(quiz);
      });
    })
  }
}