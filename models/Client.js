var keystone = require('keystone');
var Types = keystone.Field.Types;

var Client = new keystone.List('Client', {
  hidden: false
});

Client.add({
  clientId: { type: String, require: true, initial: true },
  clientSecret: { type: String, require: true, initial: true },
});

Client.defaultColumns = 'clientId, clientSecret';
Client.register();
