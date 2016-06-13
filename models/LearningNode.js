var keystone = require('keystone');
var Types = keystone.Field.Types;

var LearningNode = new keystone.List('LearningNode', {
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true
});

LearningNode.add({
  name: { type: String, required: true, index: true, note: '* to refresh Coggle diagram, go to the learning path edit page, check refreshCoggleDiagram and save.' },
  description: { type: Types.Textarea, height: 150 },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true, initial: true },
  parent: { type: Types.Relationship, ref: 'LearningNode', filters: { nodeType: 'course' }, initial: true },
  nodeType: { type: Types.Select, options: 'course, activity', default: 'activity', required: true, initial: true },
  cover: {
    url: { type: String, dependsOn: { nodeType: 'course' } }
  },
  company: { type: Types.Relationship, ref: 'Company', index: true, dependsOn: { nodeType: 'activity' } },
  problem: { type: Types.Html, wysiwyg: true, dependsOn: { nodeType: 'activity' } },
  knowledge: { type: Types.Html, wysiwyg: true, dependsOn: { nodeType: 'activity' } },
  estimation: { type: Types.Number, dependsOn: { nodeType: 'activity' } },
  no: { type: Types.Number, dependsOn: { nodeType: 'activity' } },
  tester: { type: String, dependsOn: { nodeType: 'activity' } }
});

LearningNode.relationship({ ref: 'LearningNode', path: 'children', refPath: 'parent' });

LearningNode.schema.post('save', function(node) {
  LearningNode.model.find({ learningPath: node.learningPath })
    .select({ __v: 0, learningPath: 0, sortOrder: 0 })
    .populate('company', { __v: 0 })
    .lean()
    .sort('sortOrder')
    .exec()
    .then(function(nodes) {
      var LearningPathModel = keystone.list('LearningPath').model;
      var tree = generateTree(nodes);

      return LearningPathModel.update(
        { _id: node.learningPath },
        { $set: { nodeTree: JSON.stringify(tree) } },
        { multi: true }
      ).exec();
    }, function(err) {
      console.log(err)
    });
});

LearningNode.defaultColumns = 'no|10%, name, description, learningPath, nodeType, parent';
LearningNode.register();

function generateTree(nodes, parentNode) {
  var result = [];
  nodes.forEach(function(node, i) {
    if (!parentNode && !node.parent || parentNode && node.parent && node.parent.equals(parentNode._id)) {
      var remain = nodes.slice(0, i).concat(nodes.slice(i + 1));
      node.children = generateTree(remain, node);
      result.push(node);
    }
  });
  return result;
}
