/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 * 
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {
	User: [
		{ 'name.first': 'Admin', 'name.last': 'User', email: 'user@keystonejs.com', password: 'admin', isAdmin: true },
		{ 'name.first': 'Toan', 'name.last': 'Nguyen', email: 'toan2406@gmail.com', password: 'admin', isAdmin: false }
	],

	Client: [
		{ 'clientId': 'hasbrain_tracker', 'clientSecret': 'h4sbr4in' }
	],

	LearningPath: [
		{ 'name': 'Front-End' },
		{ 'name': 'Node.js' },
		{ 'name': 'Android' },
		{ 'name': 'iOS' }
	]
};

/*

// This is the long-hand version of the functionality above:

var keystone = require('keystone'),
	async = require('async'),
	User = keystone.list('User');

var admins = [
	{ email: 'user@keystonejs.com', password: 'admin', name: { first: 'Admin', last: 'User' } }
];

function createAdmin(admin, done) {
	
	var newAdmin = new User.model(admin);
	
	newAdmin.isAdmin = true;
	newAdmin.save(function(err) {
		if (err) {
			console.error("Error adding admin " + admin.email + " to the database:");
			console.error(err);
		} else {
			console.log("Added admin " + admin.email + " to the database.");
		}
		done(err);
	});
	
}

exports = module.exports = function(done) {
	async.forEach(admins, createAdmin, done);
};

*/
