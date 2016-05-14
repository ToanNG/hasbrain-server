var keystone = require('keystone');
var request = require('superagent');
var Types = keystone.Field.Types;

var LearningPath = new keystone.List('LearningPath', {
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true
});

LearningPath.add({
  name: { type: String, required: true, index: true },
  description: { type: Types.Textarea, height: 150 },
  diagram: { type: String, index: true },
  nodeTree: { type: Types.Textarea, hidden: true }
}, 'Controls', {
  refreshCoggleDiagram: { type: Boolean }
});

LearningPath.relationship({ ref: 'LearningNode', path: 'courses', refPath: 'learningPath' });

LearningPath.schema.pre('save', function(next) {
  if (this.refreshCoggleDiagram) {
    request
      .get('http://localhost:3000/coggle/draw-tree')
      .query({
        path_id: this.id,
        coggle_token: '74a67260efe99fa5607956e96ee4f9d981c65f08e9a173cd26529a10827f7c9f2c528bbb71f7ac090d6cf6169f220e9b3520285a0c20988b3dc12df2ee6f56ec'
      })
      .end();
  }
  this.refreshCoggleDiagram = undefined;
  next();
});

LearningPath.defaultColumns = 'sortOrder|10%, name, description';
LearningPath.register();
