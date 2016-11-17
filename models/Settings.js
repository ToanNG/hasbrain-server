var keystone = require('keystone');
var Types = keystone.Field.Types;

var Settings = new keystone.List('Settings', {
  false: true,
  nocreate: false,
  nodelete: true,
  hidden: false
});

Settings.add({
  chainingPoints: { type: Number, required: true, default: 0 },
  maxChainingLevel: { type: Number, required: true, default: 0 },
  upvotePoints: { type: Number, required: true, default: 0 },
  replyPoints: { type: Number, required: true, default: 0 },
  dailyScrumPoints: { type: Number, required: true, default: 0 }
});

Settings.defaultColumns = 'chainingPoints, maxChainingLevel, upvotePoints, replyPoints, dailyScrumPoints';
Settings.register();
