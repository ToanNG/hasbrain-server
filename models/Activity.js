var keystone = require('keystone');
var Types = keystone.Field.Types;

var Activity = new keystone.List('Activity', {
  autokey: { path: 'slug', from: 'name', unique: true }
});

Activity.add({
  name: { type: String, required: true, index: true },
  description: { type: Types.Textarea, height: 150 },
  estimation: { type: Types.Number, require: true },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true, required: true, initial: true },
  course: { type: Types.Relationship, ref: 'Course', index: true, filters: { 'learningPath': ':learningPath' } }
});

Activity.schema.path('course').validate(function(value, callback) {
  if (this.course) {
    keystone.list('Course').model.findById(value).exec(function(err, course) {
      callback(course.learningPath.equals(this.learningPath));
    }.bind(this));
  } else {
    callback(true);
  }
}, 'Course is mismatched with learning path');

Activity.defaultColumns = 'name, description, estimation, learningPath, course';
Activity.register();
