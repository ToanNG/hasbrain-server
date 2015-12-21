var keystone = require('keystone');
var Types = keystone.Field.Types;

var Course = new keystone.List('Course', {
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true
});

Course.add({
  name: { type: String, required: true, index: true },
  description: { type: Types.Textarea, height: 150 },
  cover: {
    url: { type: String }
  },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true }
});

Course.relationship({ ref: 'Activity', path: 'activities', refPath: 'course' });

Course.defaultColumns = 'sortOrder|10%, name, description, learningPath';
Course.register();
