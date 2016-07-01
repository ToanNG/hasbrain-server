var async = require('async'),
    keystone = require('keystone'),
    util = require('util'),
    request = require('superagent'),
    pubnub = require('pubnub')({
      ssl: true,
      publish_key: 'pub-c-8807fd6d-6f87-486f-9fd6-5869bc37e93a',
      subscribe_key: 'sub-c-861f96a2-3c20-11e6-9236-02ee2ddab7fe',
    });

var Story = keystone.list('Story');

function NotFound(message) {  
  Error.call(this);
  this.statusCode = 404;
  this.message = message;
}

util.inherits(NotFound, Error);

exports.build = function(req, res, next) {
  Story.model.findById(req.body.story)
    .select({ __v: 0 })
    .populate('enrollment', 'student')
    .populate('activity', 'tester no')
    .exec(function(err, story) {
      if (err) return next(err);
      if (!story) return next(new NotFound('Story not found'));
      if (!req.user._id.equals(story.enrollment.student)) return next(new Error('Unauthorized'));
      
      request
        .post(story.activity.tester)
        .send({
          build_parameters: {
            TARGET_REPO: req.body.repo,
            STORY_ID: story._id,
            ACTIVITY_NO: story.activity.no
          }
        })
        .set('Content-Type', 'application/json')
        .end(function(err, data) {
          if (err) return next(err);
          return res.status(200).apiResponse({ status: 'success' });
        });
    });
}

exports.completeStory = function(req, res, next) {
  var payload = req.body.payload;

  Story.model.findById(payload.build_parameters.STORY_ID)
    .populate('enrollment', 'student')
    .exec(function(err, story) {
      if (err) return next(err);
      if (!story) return next(new NotFound('Story not found'));

      if (payload.failed) {
        pubnub.publish({ 
          channel: 'hasbrain_test_' + story.enrollment.student,
          message: { text: 'Test fails! Please try again.' }
        });
        return res.status(200).send();
      }
      
      story.getUpdateHandler(req).process({ isCompleted: true }, function(err) {
        if (err) return next(err);
        
        pubnub.publish({ 
          channel: 'hasbrain_test_' + story.enrollment.student,
          message: { text: 'Congrat! You passed the test.' }
        });
        return res.status(200).send();
      });
    });
}