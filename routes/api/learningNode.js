var async = require('async'),
	keystone = require('keystone'),
	_ = require('lodash');

var LearningNodeModel = keystone.list('LearningNode').model,
    EnrollmentModel = keystone.list('Enrollment'),
    StoryModel = keystone.list('Story');

function NotFound(message) {  
	Error.call(this);
	this.statusCode = 404;
	this.message = message;
}

exports.getTodayLearningNode = function(req, res, next) {
  	var learningNode = req.params.learningNode;
  	if( learningNode ) {
	  	/*
		GET first node of learningNode.
	  	*/
		return LearningNodeModel.findOne({
            parent: learningNode
      	})
		.sort('sortOrder')
		.exec()
		.then(function(node) {
          	return res.status(200).apiResponse(node);
        });
  	} else {
	  	/*
	  	GET enroll infomation:
	  	-- if dont exist, return 404
		-- If exist, check if story does not finish.
	  	-- -- if exist, get current learningNode
	  	-- -- if not, get next learningNode in node tree.
	  	*/
	  	EnrollmentModel.findOne({
	  		student: req.user._id,
	      	isActive: true
	    })
	    .exec()
	    .then(function(enrollment) {
	      if (!enrollment)
	    	return next(new NotFound('Enrollment not found'));

	      	return StoryModel.find({
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
	        	return LearningNodeModel.findOne({
	            	_id: uncompletedStory.activity,
	            	nodeType : 'activity'
	          	})
	          	.exec()
	          	.then(function(story) {
	            	return _.assign({}, story.toObject(), {
		              	isCompleted: uncompletedStory.isCompleted,
		              	startTime: uncompletedStory.startTime,
		              	storyId: uncompletedStory._id
	            	})
	          	});
	      	} else {
	        	return LearningNodeModel.findOne({
		            _id: { $nin: completedActivities },
		            learningPath: data.enrollment.learningPath,
		            nodeType : 'activity'
	          	})
				.sort('function')
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
  
}

exports.list = function(req, res, next) {
  LearningNodeModel.find()
    .exec()
    .then(function(items) {
      return res.status(200).apiResponse({
        learningNodes: items
      });
    }, function(err) {
      return next(err)
    });
}