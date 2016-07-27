var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password },
	avatar: { type: String },
  levelTips: { type: Number, default: 0 }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Admin', index: true },
	isSuperAdmin: { type: Boolean, label: 'Super admin', index: true }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});

/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin, isSuperAdmin';
User.register();
