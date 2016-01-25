var async = require('async'),
    keystone = require('keystone'),
    util = require('util'),
    request = require('superagent'),
    pubnub = require('pubnub')({
      ssl: true,
      publish_key: 'pub-c-f2f74db9-1fb1-4376-8f86-89013b0903fd',
      subscribe_key: 'sub-c-9f9d4258-b37e-11e5-9848-0619f8945a4f'
    });

var buildUrl = 'https://circleci.com/api/v1/project/ToanNG/:tester/tree/master?circle-token=1e0d54eafd8f594f7be72999699f005fa2a06a33';

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
        .post(buildUrl.replace(':tester', story.activity.tester))
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

  if (payload.failed) {
    pubnub.publish({ 
      channel: 'hasbrain_test',
      message: { text: 'Test fails! Please try again.' }
    });
    return next(new Error('Test failed'));
  }

  Story.model.findById(payload.build_parameters.STORY_ID).exec(function(err, item) {
    if (err) return next(err);
    if (!item) return next(new NotFound('Story not found'));
    
    item.getUpdateHandler(req).process({ isCompleted: true }, function(err) {
      if (err) return next(err);
      
      pubnub.publish({ 
        channel: 'hasbrain_test',
        message: { text: 'Congrat! You passed the test.' }
      });
      return res.status(200).apiResponse(item);
    });
  });
}