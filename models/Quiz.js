var keystone = require('keystone');
var Types = keystone.Field.Types;

var Quiz = new keystone.List('Quiz', {
  map: { name: 'question' }
});

Quiz.add({
  question: { type: String, required: true, initial: true, index: true },
  answers: { type: Types.Textarea, required: true, initial: true },
  opts: { type: Types.Textarea, required: true, initial: true }
});

Quiz.defaultColumns = 'no|10%, question';
Quiz.register();
