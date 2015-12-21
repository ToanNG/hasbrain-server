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

	Course: [
		{ name: 'Basic HTML & CSS', learningPath: 'front_end', __ref: 'basic_html_css', 'cover.url': 'http://www.thelogica.com/wp-content/uploads/2011/03/THELOGICA_HTML_COVER.jpg' },
		{ name: 'Javascript Fundamental', learningPath: 'front_end', __ref: 'js_fundamental', 'cover.url': 'http://www.crossmediaconsultancy.co.uk/wp-content/uploads/2015/09/javascript-logo-banner.jpg' },
		{ name: 'jQuery', learningPath: 'front_end', __ref: 'jquery', 'cover.url': 'http://creativeindividual.co.uk/wp-content/uploads/2010/10/jquery_banner.jpg' }
	],

	Activity: [
		{
			name: 'Front-end Foundations',
			learningPath: 'front_end',
			course: 'basic_html_css',
			practiceLink: 'https://www.codeschool.com/courses/front-end-foundations',
			description: 'Learn how to create a website with HTML and CSS, and in the process build a strong foundation for more advanced front-end development.',
			estimation: 1,
			order: 1
		},
		{
			name: 'CSS Cross-Country',
			learningPath: 'front_end',
			course: 'basic_html_css',
			practiceLink: 'https://www.codeschool.com/courses/css-cross-country',
			description: 'Learn the fundamentals & foundational elements of CSS with CSS Cross-Country. Review all the web-styling necessities for front-end efficiency.',
			estimation: 2,
			order: 2
		},
		{
			name: 'JavaScript Road Trip Part 1',
			learningPath: 'front_end',
			course: 'js_fundamental',
			practiceLink: 'https://www.codeschool.com/courses/javascript-road-trip-part-1',
			description: 'An introduction to the very basics of the JavaScript language. Build a foundation of JavaScript syntax and learn how to use values, variables, and files.',
			estimation: 1,
			order: 3
		},
		{
			name: 'JavaScript Road Trip Part 2',
			learningPath: 'front_end',
			course: 'js_fundamental',
			practiceLink: 'https://www.codeschool.com/courses/javascript-road-trip-part-2',
			description: 'A continued introduction to the very basics of the JavaScript language. Learn common programming mechanisms like loops, conditionals, functions, and arrays.',
			estimation: 1,
			order: 4
		},
		{
			name: 'JavaScript Road Trip Part 3',
			learningPath: 'front_end',
			course: 'js_fundamental',
			practiceLink: 'https://www.codeschool.com/courses/javascript-road-trip-part-3',
			description: 'Continue building intermediate skills within the JavaScript web programming language. Master function expressions, closures, hoisting, objects, and the use of prototypes.',
			estimation: 1,
			order: 5
		},
		{
			name: 'JavaScript Best Practices',
			learningPath: 'front_end',
			course: 'js_fundamental',
			practiceLink: 'https://www.codeschool.com/courses/javascript-best-practices',
			description: 'Become a more informed, conscientious user of JavaScript as you explore time-tested, useful techniques that will improve legibility, performance quality, and safety in your scripts.',
			estimation: 3,
			order: 6
		},
		{
			name: 'Try jQuery',
			learningPath: 'front_end',
			course: 'jquery',
			practiceLink: 'https://www.codeschool.com/courses/try-jquery',
			description: 'Learn the basic building blocks of jQuery 2.0 and enjoy new video tutorials for beginners with related programming challenges.',
			estimation: 2,
			order: 7
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
