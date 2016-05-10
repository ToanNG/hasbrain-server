var keystone = require('keystone');
var Types = keystone.Field.Types;

var Story = new keystone.List('Story', {
  nocreate: true,
  noedit: false,
  nodelete: false,
  hidden: false
});

Story.add({
  enrollment: { type: Types.Relationship, ref: 'Enrollment', required: true, initial: true },
  activity: { type: Types.Relationship, ref: 'LearningNode', required: true, initial: true },
  startTime: { type: Types.Datetime, default: Date.now },
  endTime: { type: Types.Datetime },
  isCompleted: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 }
});

Story.schema.index({ enrollment: 1, activity: 1 }, { unique: true });

Story.schema.pre('save', function(next) {
    if (this.isCompleted && !this.endTime) {
        this.endTime = new Date();
    }
    next();
});

Story.defaultColumns = 'enrollment, activity, startTime, endTime, isCompleted, attempts';
Story.register();
