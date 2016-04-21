var async = require('async'),
	keystone = require('keystone'),
	_ = require('lodash');

var LearningNodeModel = keystone.list('LearningNode').model;

exports.list = function(req, res, next) {
	LearningNodeModel.find({ learningPath: req.params.pathId })
		.limit(1)
		.sort({$natural:-1})
		.exec()
		.then(function(item) {
		  	return res.status(200).apiResponse(JSON.parse(item[0].json));
		}, function(err) {
		  	return next(err)
		});
}