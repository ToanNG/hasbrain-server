var async = require('async'),
    keystone = require('keystone');

var Enrollment = keystone.list('Enrollment');

exports.create = function(req, res, next) {
  var item = new Enrollment.model({ student: req.user });

  item.getUpdateHandler(req).process({ learningPath: req.body.learning_path }, function(err) {
    if (err) return next(err);
    
    return res.status(200).apiResponse(item);
  });
}