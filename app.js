/**
 * Module dependencies.
 */

var sys = require('sys');

require.paths.unshift('./modules');

var express = require('express'),
		cf = require("cloudfoundry"),
		Soundcloud = require('./modules/models/soundcloud').Soundcloud,
		User = require('./modules/models/user');
		
var app = module.exapp_ports = express.createServer();

// Configuration
var host = 'localhost';
var app_port = cf.getAppPort() || 3000;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "scPl1337keybordNinjaD3luxx"
	})),
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

//App middleware
var soundcloud;


//Router middleware
function ifUserAuthenticated(req, res, next){
	if(req.session.soundcloud_id) next()
	else res.render(null, {
		"error" : "Acces Denied"
	});
};

function loadUser(req, res, next){
	User.findOne({soundcloud_id: req.session.soundcloud_id}, function(err, model) {
		if(err) throw new Error(err)
		else {
			req.user = {};
			req.user.model = model;
			next();
		}
	});
};

app.param(':id', function(id) { return parseInt(id);});

app.param(':format', function(req, res, next, format) {
	switch(format){
		
		case 'json':
			res.contentType('application/json');
			res.render = function(nulll, data) {
				res.send(''+JSON.stringify(data)+'');
			};
			next();
			break;
		
		case 'jsonp':
			res.contentType('application/json');
			res.render = function(nulll, data) {
				var jsonpCallback = req.query['jsonpCallback'];
				if(jsonpCallback) res.send(jsonpCallback+'('+JSON.stringify(data)+')')
				else res.send(JSON.stringify({
					'error': 'No ?jsonpCallback padding specified in request'
				}));
			};
			next();
			break;
		
		default:
			res.contentType('text/html');
			next();
			break;
	}
})


// Routes
app.get('/', function(req, res){
	res.render('index', {
		title: 'scpl'
	});
});

app.get('/user.:format?', ifUserAuthenticated, loadUser, function(req, res) {
	res.render('user', req.user.model);
});

app.get('/user/playlists.:format?', ifUserAuthenticated, loadUser, function(req, res) {
	res.render('playlists', req.user.model.playlists);
});

app.get('/user/playlists/:playlist_id/update.:format', ifUserAuthenticated, loadUser, function(req, res) {
	try{
		var playlistData = JSON.parse(req.query['playlistData']);
	} catch(err){
		res.resnder(null, {
			'error': err
		});
	}
	var user = req.user.model;
	if(playlistData && user){
		user.playlists.id(req.params['playlist_id']).title = playlistData.title || 'Untitled';
		user.playlists.id(req.params['playlist_id']).tags = playlistData.tags || ['no-tags'];
		user.playlists.id(req.params['playlist_id']).tracks = playlistData.tracks || [];
		user.save(function(err) {
			if(err) res.render(null, {
				'error': err
			})
			else {
				res.render(null, {
					'success': 'Updated'
				})				
			}
		});
	} else if(!playlistData){
		res.render(null, {
			'error': 'no playlistdata in the request'
		});
	} else {
		res.render(null, {
			'error': 'could not find the associated user'
		});
	}
});

app.get('/user/playlists/create.:format', ifUserAuthenticated, loadUser, function(req, res) {
	var user = req.user.model;
	var playlistData = JSON.parse(req.query['playlistData']);
	var pls = {};
	if(playlistData){
		pls.tags = playlistData.tags;
		pls.title = playlistData.title;
		pls.tracks = [];
		user.playlists.push(pls);
		user.save(function(err) {
			if(err) res.render(null, {
				'error': err
			})
			else res.render(null, {
				'success': 'created',
				'playlistdata': user.playlists[user.playlists.length-1]
			})
		})
	} else {
		res.render(null, {
			'error': 'no playlistdata in the request'
		})
	}
	
});

app.get('/user/playlists/:playlist_id/destroy.:format', ifUserAuthenticated, loadUser, function(req, res) {
	var user = req.user.model;
	user.playlists.id(req.params['playlist_id']).remove();
	user.save(function(err) {
		if(err) res.render(null, {
			'error': err
		})
		else {
			res.render(null, {
				'success': 'Destroyed'
			});
		}
	})
});

app.get('/probeaccess.:format', ifUserAuthenticated, function(req, res) {
	res.render(null, {
		'success': 'user is authenticated'
	});
});

app.get('/authorizeapp', function(req, res) {
	if(!req.query['error'] && req.query['code']){
		var authCode = req.query['code'];
		soundcloud = new Soundcloud();
		soundcloud.authorize(null, authCode, function(tokens) {
			soundcloud.tokens = tokens;
			soundcloud.me(function(err, me) {
				if(err) {
					req.session.destroy();
					throw new Error(err);
				}
				else {
					//Try to find the user with the given soundclud id
					User.findOne({soundcloud_id: me.id}, function(err, user) {
						if(err) throw new Error(err)
						else if(user){
							req.session.user_id = user._id;
							req.session.soundcloud_id = me.id;
							res.render('connected', {});
						} else {
							//If it doesnt: create new user, save it and																						
							var newUser = new User();
							newUser.soundcloud_id = me.id;
							newUser.save(function(err) {											
								if(err) throw new Error(err)
								else {
									req.session.soundcloud_id = me.id;
									res.render('connected', {});
								}
							});
						}
					});
				}
			});
		});
	} else {
		throw new Error(req.query['error'] + ' : ' + req.query['error_description']);
	}
});

if (!module.parent) {
  app.listen(cf.getAppPort() || app_port);
  console.log("Express server listening on app_port %d", app.address().port);
}






