var keystone = require('keystone');
var Types = keystone.Field.Types;

var Pairing = new keystone.List('Pairing');

Pairing.add({
  studentA: { type: Types.Relationship, ref: 'User', required: true, initial: true },
  studentB: { type: Types.Relationship, ref: 'User', required: true, initial: true },
  learningPath: { type: Types.Relationship, ref: 'LearningPath', required: true, initial: true },
  createdAt: { type: Types.Date, default: Date.now },
});

Pairing.relationship({ ref: 'User', path: 'studentA', refPath: 'studentA' });
Pairing.relationship({ ref: 'User', path: 'studentB', refPath: 'studentB' });

Pairing.defaultColumns = 'studentA, studentB, learningPath, createdAt';
Pairing.register();
