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
		{ 'name.first': 'Admin', 'name.last': 'User', email: 'user@keystonejs.com', password: 'admin', isAdmin: true, isSuperAdmin: true },
		{ 'name.first': 'Toan', 'name.last': 'Nguyen', email: 'toan2406@gmail.com', password: 'mentor', isAdmin: false }
	],

	Client: [
		{ clientId: 'hasbrain_tracker', clientSecret: 'h4sbr4in' }
	],

	LearningPath: [
		{ name: 'Front-End', __ref: 'front_end' },
		{ name: 'Node.js', __ref: 'nodejs' },
		{ name: 'Android', __ref: 'android' },
		{ name: 'iOS', __ref: 'ios' }
	],

	LearningNode: [
		{
			name: 'Javascript Fundamental',
			nodeType: 'course',
			learningPath: 'front_end',
			'cover.url': 'http://www.crossmediaconsultancy.co.uk/wp-content/uploads/2015/09/javascript-logo-banner.jpg',
			__ref: 'js_fundamental'
		},
		{
			name: 'Arguments',
			nodeType: 'activity',
			learningPath: 'front_end',
			parent: 'js_fundamental',
			description: 'Learn what argument is in Javascript.',
			problem: '<p>Implement a function that returns the sum of its parameters. For example:</p> <pre><code class="language-javascript">sum(2, 4, 6) // =&gt; 12</code></pre> <p>You can get the code boilerplate <a href="#">here</a>.</p>',
			knowledge: '<p>The arguments object is an Array-like object corresponding to the arguments passed to a function. It is similar to an Array, but does not have any Array properties except length. However it can be converted to a real Array:</p><pre><code class="language-javascript">var args = Array.prototype.slice.call(arguments);</code></pre><p>Watch the following video for more details</p><p><iframe src="https://www.youtube.com/embed/cBzwch3mqxA" width="560" height="315" frameborder="0" allowfullscreen=""></iframe></p>',
			estimation: 1,
			no: 1,
			tester: 'https://circleci.com/api/v1/project/ToanNG/node-test/tree/master?circle-token=1e0d54eafd8f594f7be72999699f005fa2a06a33'
		}
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
