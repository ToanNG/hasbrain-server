var keystone = require('keystone');
var Types = keystone.Field.Types;

var Course = new keystone.List('Course', {
  autokey: { path: 'slug', from: 'name', unique: true }
});

Course.add({
  name: { type: String, required: true, index: true },
  description: { type: Types.Textarea, height: 150 },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true }
});

Course.defaultColumns = 'name, description, learningPath';
Course.register();
