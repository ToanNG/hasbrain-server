var keystone = require('keystone');
var Types = keystone.Field.Types;

var Enrollment = new keystone.List('Enrollment');

Enrollment.add({
  student: { type: Types.Relationship, ref: 'User', required: true, initial: true },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', required: true, initial: true },
  createdAt: { type: Types.Date, default: Date.now },
}, 'Status', {
  isActive: { type: Boolean, default: true }
});

Enrollment.schema.index({ student: 1, learningPath: 1 }, { unique: true });

Enrollment.defaultColumns = 'student, learningPath, createdAt, isActive';
Enrollment.register();
