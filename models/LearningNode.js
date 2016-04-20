var keystone = require('keystone');
var Types = keystone.Field.Types;

var LearningNode = new keystone.List('LearningNode', {
	autokey: { path: 'slug', from: 'name', unique: true },
	sortable: true
});

LearningNode.add({
	name: { type: String, required: true, index: true },
	description: { type: Types.Textarea, height: 150 },
	learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true, initial: true },
	node: { type: Types.Relationship, ref: "LearningNode", index: true, initial: true, label: "Parent node"}
});


LearningNode.defaultColumns = 'sortOrder|10%, name, description, node';
LearningNode.register();
