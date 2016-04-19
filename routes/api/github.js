var keystone = require('keystone'),
    request = require('superagent'),
    tokenStore = {};

exports.callback = function(req, res, next) {
  var q = req.query,
      view = new keystone.View(req, res);

  request
    .post('https://github.com/login/oauth/access_token')
    .send({
      client_id: '472d3f7775e7e51c6660',
      client_secret: 'f01542b6f5b37d4bbbf50c53693521c921b67b47',
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
