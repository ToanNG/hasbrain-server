var keystone = require('keystone');
var Types = keystone.Field.Types;

var LearningNode = new keystone.List('LearningNode', {
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true
});

LearningNode.add({
  name: { type: String, required: true, index: true },
  description: { type: Types.Textarea, height: 150 },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true, required: true, initial: true },
  parent: { type: Types.Relationship, ref: 'LearningNode', filters: { nodeType: 'course' }, initial: true },
  nodeType: { type: Types.Select, options: 'course, activity', default: 'activity', required: true, initial: true },
  company: { type: Types.Relationship, ref: 'Company', index: true, dependsOn: { nodeType: 'activity' } },
  problem: { type: Types.Html, wysiwyg: true, dependsOn: { nodeType: 'activity' } },
  knowledge: { type: Types.Html, wysiwyg: true, dependsOn: { nodeType: 'activity' } },
  estimation: { type: Types.Number, dependsOn: { nodeType: 'activity' } },
  no: { type: Types.Number, dependsOn: { nodeType: 'activity' } },
  tester: { type: String, dependsOn: { nodeType: 'activity' } }
});

LearningNode.relationship({ ref: 'LearningNode', path: 'children', refPath: 'parent' });

LearningNode.defaultColumns = 'sortOrder|10%, name, description, learningPath, nodeType, parent';
LearningNode.register();
