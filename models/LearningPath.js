var keystone = require('keystone');
var Types = keystone.Field.Types;

var LearningPath = new keystone.List('LearningPath', {
  autokey: { path: 'slug', from: 'name', unique: true }
});

LearningPath.add({
  name: { type: String, required: true, index: true },
  description: { type: Types.Textarea, height: 150 }
});

LearningPath.relationship({ ref: 'Course', path: 'courses', refPath: 'learningPath' });

LearningPath.defaultColumns = 'name, description';
LearningPath.register();
