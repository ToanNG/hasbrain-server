var async = require('async'),
	keystone = require('keystone'),
	_ = require('lodash');

var LearningNodeModel = keystone.list('LearningNode').model;

exports.list = function(req, res, next) {
  LearningNodeModel.find({ learningPath: req.params.pathId })
	.exec()
	.then(function(items) {
		var arr = [];
	  	for (var i = 0; i < items.length; i++) {
	  		if( !items[i].node ){
	  			var obj = { name : items[i].name, node : items[i].node };
		  		obj.nodes = recursion(items[i], items);
				arr.push(obj);
	  		}
	  	}
	  	return res.status(200).apiResponse(arr);
	}, function(err) {
	  	return next(err)
	});
}

function recursion(item, items){
	var arr = [];
	for (var i = 0; i < items.length; i++) {

		if( items[i]._id != item._id && JSON.stringify(items[i].node) === JSON.stringify(item._id) ) {
			var obj = { name : items[i].name };
			obj.nodes = recursion(items[i], items);
			arr.push(obj);
		}

  	}
  	return arr;
}