var keystone = require('keystone');
var Types = keystone.Field.Types;

var Company = new keystone.List('Company', {
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true
});

Company.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
  email: { type: Types.Email, required: true, initial: true, index: true },
  contact: { type: Types.Url, required: true, initial: true, index: true },
  description : {type: Types.Html, wysiwyg: true }
});

Company.defaultColumns = 'name, email, contact';
Company.register();
