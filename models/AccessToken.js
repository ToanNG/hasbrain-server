var keystone = require('keystone');
var Types = keystone.Field.Types;

var AccessToken = new keystone.List('AccessToken', {
  noedit: true,
  nocreate: true,
  nodelete: false,
  hidden: false
});

AccessToken.add({
  token: { type: String, required: true },
  clientId: { type: String },
  userId: { type: String },
  expirationDate: { type: Date }
});

AccessToken.defaultColumns = 'token, clientId, userId, expirationDate';
AccessToken.register();
