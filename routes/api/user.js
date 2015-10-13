var async = require('async'),
    keystone = require('keystone');

var User = keystone.list('User');

exports.list = function(req, res, next) {
  User.model.find({ isAdmin: false })
    .select({ __v: 0, password: 0, isAdmin: 0 })
    .exec()
    .then(function(items) {
      return res.status(200).apiResponse({
        users: items
      });
    }, function(err) {
      return next(err)
    });
}

exports.me = function(req, res, next) {
  User.model.findById(req.user._id)
    .select({ __v: 0, password: 0, isAdmin: 0 })
    .exec()
    .then(function(item) {
      return res.status(200).apiResponse(item);
    }, function(err) {
      return next(err);
    });
}