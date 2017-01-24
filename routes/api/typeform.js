var async = require('async'),
    keystone = require('keystone'),
    util = require('util'),
    request = require('superagent'),
    pubnub = require('pubnub')({
      ssl: true,
      publish_key: 'pub-c-8807fd6d-6f87-486f-9fd6-5869bc37e93a',
      subscribe_key: 'sub-c-861f96a2-3c20-11e6-9236-02ee2ddab7fe',
    });

var Story = keystone.list('Story'),
    Enrollment = keystone.list('Enrollment');

function NotFound(message) {
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

util.inherits(NotFound, Error);

exports.hook = function(req, res, next) {
  var data = req.body;
  if (data) {
    Enrollment.model.findOne({
      student: data.form_response.hidden.student_id
    })
    .exec()
    .then(function(enroll){
      if(!enroll) return next(NotFound('Enrollment not found'));

      Story.model.findOne({
        _id: data.form_response.hidden.story_id,
        enrollment: enroll._id
      })
      .exec()
      .then(function(story){
        if(!story) return next(NotFound('Story not found'));

        story.solvedProblem = true;
        story.showKnowledge = true;
        story.typeFormData = JSON.stringify(data);
        story.save(function(err) {
          if (err) return next(err);
          pubnub.publish({
            channel: 'hasbrain_test_' + data.form_response.hidden.student_id,
            message: {
              text: 'Congrat! You passed the test.',
              type: 'test_result',
              status: 1
            }
          });
          return res.status(200).send();
        });
      });
    })
    .then(null, function(err) {
      return next(err);
    });
  }
}
