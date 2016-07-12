var keystone = require('keystone');
var Types = keystone.Field.Types;

const Story = new keystone.List('Story', {
  nocreate: false,
  track: {
    createdAt: true,
    updatedAt: true
  }
});

Story.add({
  enrollment: { type: Types.Relationship, ref: 'Enrollment', filters: { isActive: true }, required: true, initial: true },
  activity: { type: Types.Relationship, ref: 'LearningNode', required: true, initial: true, filters: { 'nodeType': 'activity' } },
  startTime: { type: Types.Datetime },
  endTime: { type: Types.Datetime },
  attempts: { type: Number, default: 0 }
}, 'Status', {
  isCompleted: { type: Types.Boolean, default: false },
  solvedProblem: { type: Types.Boolean, default: false },
  showKnowledge: { type: Types.Boolean, default: false },
});

//Story.schema.index({ enrollment: 1, activity: 1 }, { unique: true });

Story.schema.pre('save', function(next) {
    if (this.solvedProblem && !this.endTime) {
        this.endTime = new Date();
    }
    next();
});

Story.defaultColumns = 'enrollment, activity, startTime, endTime, isCompleted, attempts';
Story.register();
