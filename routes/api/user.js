var async = require('async'),
    keystone = require('keystone');

var User = keystone.list('User');

exports.list = function(req, res) {
  User.model.find({ isAdmin: false })
    .exec()
    .then(function(items) {
      return res.apiResponse({
        users: items
      });
    }, function(err) {
      return res.apiError('database error', err);
    });
}

exports.me = function(req, res) {
  return res.apiResponse(req.user);
}