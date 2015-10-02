var keystone = require('keystone')
	, passport = require('passport')
	, BasicStrategy = require('passport-http').BasicStrategy
	, ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
	, BearerStrategy = require('passport-http-bearer').Strategy
	, crypto = require('crypto');

var User = keystone.list('User')
	, Client = keystone.list('Client')
	, AccessToken = keystone.list('AccessToken');

/**
 * These strategies are used to authenticate registered OAuth clients.
 * The authentication data may be delivered using the basic authentication scheme (recommended)
 * or the client strategy, which means that the authentication data is in the body of the request.
 */
passport.use("clientBasic", new BasicStrategy(
	function (clientId, clientSecret, done) {
		Client.model.findOne({clientId: clientId}, function (err, client) {
			if (err) return done(err)
			if (!client) return done(null, false)

			if (client.clientSecret == clientSecret) return done(null, client)
			else return done(null, false)
		});
	}
));

passport.use("clientPassword", new ClientPasswordStrategy(
	function (clientId, clientSecret, done) {
		Client.model.findOne({clientId: clientId}, function (err, client) {
			if (err) return done(err)
			if (!client) return done(null, false)

			if (client.clientSecret == clientSecret) return done(null, client)
			else return done(null, false)
		});
	}
));

/**
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).
 */
passport.use("accessToken", new BearerStrategy(
	function (accessToken, done) {
		var accessTokenHash = crypto.createHash('sha1').update(accessToken).digest('hex')
		AccessToken.model.findOne({token: accessTokenHash}, function (err, token) {
			if (err) return done(err)
			if (!token) return done(null, false)
			if (new Date() > token.expirationDate) {
				AccessToken.model.remove({token: accessTokenHash}, function (err) { done(err) })
			} else {
				User.model.findOne({email: token.userId}, function (err, user) {
					if (err) return done(err)
					if (!user) return done(null, false)
					// no use of scopes for no
					var info = { scope: '*' }
					done(null, user, info);
				})
			}
		})
	}
))