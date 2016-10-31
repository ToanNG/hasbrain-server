var keystone = require('keystone'),
    request = require('superagent'),
    tokenStore = {};

exports.callback = function(req, res, next) {
  var q = req.query,
      view = new keystone.View(req, res);

  request
    .post('https://github.com/login/oauth/access_token')
    .send({
      client_id: '49ec56687000a737f1d5',
      client_secret: '732100d94931d9af182ec5f3c82c8865919d4430',
      code: q.code
    })
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (!err) {
        tokenStore[q.c] = JSON.stringify(res.body);
      }
      view.render('success');
    });
}

exports.exchangeToken = function(req, res, next) {
  var code = req.body.code;

  if (!tokenStore[code]) {
    return next(new Error('Login fail'));
  }

  res.status(200).apiResponse(tokenStore[code]);
  delete tokenStore[code];
}
