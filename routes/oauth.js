var keystone = require('keystone')
	, oauth2orize = require('oauth2orize')
	, passport = require('passport')
	, crypto = require('crypto')
	, request = require('superagent')
	, _ = require('lodash')
	, utils = require('./utils');

var User = keystone.list('User')
	, AccessToken = keystone.list('AccessToken')
	, RefreshToken = keystone.list('RefreshToken');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

//Resource owner password
server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {
	if (username === 'user.github@hasbrain.com') {
		return request
			.get('https://api.github.com/user/emails?access_token=' + password)
			.end(function(err, res) {
				var primaryEmail = _.find(res.body, 'primary').email,
						token = utils.uid(256),
						refreshToken = utils.uid(256),
						tokenHash = crypto.createHash('sha1').update(token).digest('hex'),
						refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex'),
						expirationDate = new Date(new Date().getTime() + (3600 * 1000));

				User.model.findOne({email: primaryEmail})
					.exec()
					.then(function(user) {
						if (!user) {
							return User.model.create({email: primaryEmail});
						} else {
							return user;
						}
					})
					.then(function() {
						return AccessToken.model.create({
							token: tokenHash,
							expirationDate: expirationDate,
							clientId: client.clientId,
							userId: primaryEmail,
							scope: scope
						});
					})
					.then(function() {
						return RefreshToken.model.create({
							refreshToken: refreshTokenHash,
							clientId: client.clientId,
							userId: primaryEmail
						});
					})
					.then(function() {
						done(null, token, refreshToken, {expires_in: expirationDate});
					})
					.then(null, function(err) {
						return done(err);
					});
			});
	}

	User.model.findOne({email: username}, function (err, user) {
		if (err) return done(err)
		if (!user) return done(null, false)
		user._.password.compare(password, function(err, isMatch) {
			if (!isMatch) return done(null, false)
			
			var token = utils.uid(256)
			var refreshToken = utils.uid(256)
			var tokenHash = crypto.createHash('sha1').update(token).digest('hex')
			var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')
			
			var expirationDate = new Date(new Date().getTime() + (3600 * 1000))
		
			AccessToken.model.create({token: tokenHash, expirationDate: expirationDate, clientId: client.clientId, userId: username, scope: scope}, function (err) {
				if (err) return done(err)
				RefreshToken.model.create({refreshToken: refreshTokenHash, clientId: client.clientId, userId: username}, function (err) {
					if (err) return done(err)
					done(null, token, refreshToken, {expires_in: expirationDate})
				})
			})
		})
	})
}))

//Refresh Token
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
	var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')

	RefreshToken.model.findOne({refreshToken: refreshTokenHash}, function (err, token) {
		if (err) return done(err)
		if (!token) return done(null, false)
		if (client.clientId !== token.clientId) return done(null, false)
		
		var newAccessToken = utils.uid(256)
		var accessTokenHash = crypto.createHash('sha1').update(newAccessToken).digest('hex')
		
		var expirationDate = new Date(new Date().getTime() + (3600 * 1000))
	
		AccessToken.model.update({userId: token.userId}, {$set: {token: accessTokenHash, scope: scope, expirationDate: expirationDate}}, function (err) {
			if (err) return done(err)
			done(null, newAccessToken, refreshToken, {expires_in: expirationDate});
		})
	})
}))

// token endpoint
exports.token = [
	passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
	server.token(),
	server.errorHandler()
]
