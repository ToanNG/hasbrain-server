var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');
var SettingsModel = keystone.list('Settings').model;

exports.get = function(req, res, next) {
  SettingsModel.findOne()
    .select({ __v: 0, _id: 0 })
    .lean()
    .exec()
    .then(function(settings) {
      return res.status(200).apiResponse(settings);
    }, function(err) {
      return next(err);
    });
}