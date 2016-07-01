var async = require('async'),
    keystone = require('keystone'),
    _ = require('lodash');

var Pairing = keystone.list('Pairing'),
    Enrollment = keystone.list('Enrollment');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

exports.getPartner = function(req, res, next){
  Enrollment.model.findOne({
    student: req.user._id,
    isActive: true
  })
  .exec()
  .then(function(enrollment){
    if (!enrollment) return next(new NotFound('Enrollment not found'));

    Pairing.model.findOne({
      $and: [
      { learningPath : enrollment.learningPath },
      {$or:[ {studentA: req.user._id}, {studentB: req.user._id} ]}
      ]
    })
    .populate('studentA', '_id email name')
    .populate('studentB', '_id email name')
    .exec()
    .then(function(pairing){
      if (!pairing) return next(new NotFound('Pairing not found'));
      
      return res.status(200).apiResponse(pairing);
    });
  })
}