var keystone = require('keystone'),
    request = require('superagent'),
    Promise = require('promise');

var LearningPathModel = keystone.list('LearningPath').model;

/*
 * Authorization step:
 *   https://coggle.it/dialog/authorize?response_type=code&scope=read%20write&client_id=571f45ba617193cd1fc3b923&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcoggle%2Fcallback
 * Sample token:
 *   74a67260efe99fa5607956e96ee4f9d981c65f08e9a173cd26529a10827f7c9f2c528bbb71f7ac090d6cf6169f220e9b3520285a0c20988b3dc12df2ee6f56ec
 */

exports.callback = function(req, res, next) {
  request
    .post('https://coggle.it/token')
    .send({
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/coggle/callback'
    })
    .set({
      Accept: 'application/json',
      Authorization: 'Basic NTcxZjQ1YmE2MTcxOTNjZDFmYzNiOTIzOmJkYzA2M2U2N2YzYmMyYjQxMDljYzM3Y2UzMGI4OTA3OWUwYWFiYmU2NjkxZDM1Y2RmOWM2N2ZlZGIxOTUxY2U='
    })
    .end(function(err, response) {
      return res.status(200).apiResponse(response.body);
    });
}

exports.drawTree = function(req, res, next) {
  var q = req.query,
      pathId = q.path_id,
      coggleToken = q.coggle_token,
      diagram,  // Selected diagram ID
      rootNode, // Selected diagram's root ID
      nodeTree; // JSON tree

  LearningPathModel
    .findById(pathId)
    .exec()
    // Get all nodes of diagram
    .then(function(path) {
      if (!path.diagram)
        throw new Error('Path ' + path._id + ' has no diagram');

      if (!path.nodeTree)
        throw new Error('Path ' + path._id + ' has no node tree');

      diagram = path.diagram;
      nodeTree = JSON.parse(path.nodeTree);

      return request
        .get('https://coggle.it/api/1/diagrams/' + diagram + '/nodes')
        .set('Authorization', 'Bearer ' + coggleToken)
        .accept('application/json');
    })
    // Remove all nodes of diagram
    .then(function(response) {
      rootNode = JSON.parse(response.text)[0]._id;

      return request
        .delete('https://coggle.it/api/1/diagrams/' + diagram + '/nodes/' + rootNode)
        .set('Authorization', 'Bearer ' + coggleToken)
        .accept('application/json');
    })
    // Generate new diagram
    .then(function() {
      return addNode(nodeTree, {
        parent: rootNode,
        diagram: diagram,
        token: coggleToken
      });
    })
    // Arrange diagram
    .then(function() {
      return request
        .put('https://coggle.it/api/1/diagrams/' + diagram + '/nodes?action=arrange')
        .set('Authorization', 'Bearer ' + coggleToken)
        .accept('application/json');
    })
    .then(function(response) {
      return res.status(200).apiResponse(JSON.parse(response.text));
    })
    .then(null, function(err) {
      return next(err);
    });
}

function addNode(source, details) {
  return new Promise(function(resolve, reject) {
    var parent = details.parent,
        diagram = details.diagram,
        token = details.token,
        count = 0;

    source.forEach(function(node) {
      //var text = node.name;
      //var text = '[' + node.name + '](http://localhost:3000/keystone/learning-nodes/' + node._id + ')';
      var text = '[' + node.name + '](http://52.74.99.100/keystone/learning-nodes/' + node._id + ')';

      request
        .post('https://coggle.it/api/1/diagrams/' + diagram + '/nodes')
        .send({
          offset: {x: 0, y: 0},
          text: text,
          parent: parent
        })
        .set('Authorization', 'Bearer ' + token)
        .accept('application/json')
        .end(function(err, response) {
          var newNode = JSON.parse(response.text)._id;
          
          if (node.children.length) {
            addNode(node.children, {
              parent: newNode,
              diagram: diagram,
              token: token
            })
            .then(function() {
              count++;
              if (count === source.length) resolve();
            });
          } else {
            count++;
            if (count === source.length) resolve();
          }
        });
    });
  });
}
