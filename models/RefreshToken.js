var keystone = require('keystone');
var Types = keystone.Field.Types;

var RefreshToken = new keystone.List('RefreshToken', {
  noedit: true,
  nocreate: true,
  nodelete: false,
  hidden: false
});

RefreshToken.add({
  refreshToken: { type: String, required: true },
  clientId: { type: String },
  userId: { type: String },
});

RefreshToken.defaultColumns = 'refreshToken, clientId, userId';
RefreshToken.register();
