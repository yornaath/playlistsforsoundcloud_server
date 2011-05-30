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

/* CREATE TEST DATA
app.get('/create', ifUserAuthenticated, loadUser, function(req, res) {
	var user = req.user.model;
	var pls = {};
	pls.tracks = [
								{"id":14267811,"created_at":"2011/04/27 08:15:05 +0000","user_id":80953,"duration":248205,"commentable":true,"state":"finished","sharing":"public","tag_list":"","permalink":"duky-my-aliens-octave-remix","description":"out now ! :D","streamable":true,"downloadable":false,"genre":"Minimal - Techno","release":"","purchase_url":"https://www.beatport.com/fr-FR/html/content/release/detail/358162/My%20Aliens%20EP%20-%20Remix%20Part%202","label_id":35524,"label_name":"substudiorecords","isrc":"","video_url":null,"track_type":"remix","key_signature":"","bpm":null,"title":"Duky - My Aliens (Octave Remix) - Substudio Records","release_year":2011,"release_month":4,"release_day":22,"original_format":"mp3","license":"all-rights-reserved","uri":"http://api.soundcloud.com/tracks/14267811","permalink_url":"http://soundcloud.com/octave_/duky-my-aliens-octave-remix","artwork_url":"http://i1.sndcdn.com/artworks-000006747249-rnaqr7-large.jpg?be751dc","waveform_url":"http://w1.sndcdn.com/VZlk8o6pGODb_m.png","user":{"id":80953,"permalink":"octave_","username":"Octave_","uri":"http://api.soundcloud.com/users/80953","permalink_url":"http://soundcloud.com/octave_","avatar_url":"http://i1.sndcdn.com/avatars-000000608100-ehc1f8-large.jpg?be751dc"},"label":{"id":35524,"permalink":"substudiorecords","username":"substudiorecords","uri":"http://api.soundcloud.com/users/35524","permalink_url":"http://soundcloud.com/substudiorecords","avatar_url":"http://i1.sndcdn.com/avatars-000000645367-y0gk95-large.jpg?be751dc"},"stream_url":"http://api.soundcloud.com/tracks/14267811/stream","playback_count":625,"download_count":0,"favoritings_count":23,"comment_count":36,"attachments_uri":"http://api.soundcloud.com/tracks/14267811/attachments"},
							 	{"id":13016865,"created_at":"2011/04/04 01:13:13 +0000","user_id":234105,"duration":562263,"commentable":true,"state":"finished","sharing":"public","tag_list":"0x7f grace remix bootleg","permalink":"0x7f-grace-rmx-bootleg","description":"*psst* this is a bootleg i did like 4 or 5 years ago for fun and i just re-discovered it on a backup-cd so i thought i just put it on soundcloud for a while as i kinda like it. plz don't sue me =)","streamable":true,"downloadable":false,"genre":"illegal","release":"","purchase_url":null,"label_id":null,"label_name":"","isrc":"","video_url":null,"track_type":"","key_signature":"","bpm":null,"title":"0x7f - grace rmx (bootleg)","release_year":null,"release_month":null,"release_day":null,"original_format":"mp3","license":"all-rights-reserved","uri":"http://api.soundcloud.com/tracks/13016865","permalink_url":"http://soundcloud.com/0x7f/0x7f-grace-rmx-bootleg","artwork_url":null,"waveform_url":"http://w1.sndcdn.com/JsBp3DOVzPzI_m.png","user":{"id":234105,"permalink":"0x7f","username":"0x7f","uri":"http://api.soundcloud.com/users/234105","permalink_url":"http://soundcloud.com/0x7f","avatar_url":"http://i1.sndcdn.com/avatars-000000650120-2hd5ba-large.jpg?be751dc"},"stream_url":"http://api.soundcloud.com/tracks/13016865/stream","playback_count":180,"download_count":0,"favoritings_count":11,"comment_count":19,"attachments_uri":"http://api.soundcloud.com/tracks/13016865/attachments"},
								{"id":13726996,"created_at":"2011/04/17 07:14:15 +0000","user_id":47976,"duration":476470,"commentable":true,"state":"finished","sharing":"public","tag_list":"","permalink":"ehn-was-the-last-cigarett","description":"nights are flying away from my hands and im feeling i got to know ","streamable":true,"downloadable":false,"genre":"tekno experimental","release":"","purchase_url":null,"label_id":null,"label_name":"","isrc":"","video_url":null,"track_type":"","key_signature":"","bpm":127.0,"title":"Ehn was the last cigarett","release_year":null,"release_month":null,"release_day":null,"original_format":"wav","license":"all-rights-reserved","uri":"http://api.soundcloud.com/tracks/13726996","permalink_url":"http://soundcloud.com/ehn-1/ehn-was-the-last-cigarett","artwork_url":"http://i1.sndcdn.com/artworks-000006636032-ma39vd-large.jpg?be751dc","waveform_url":"http://w1.sndcdn.com/8zdn2XdbDBsb_m.png","user":{"id":47976,"permalink":"ehn-1","username":"ehn - -","uri":"http://api.soundcloud.com/users/47976","permalink_url":"http://soundcloud.com/ehn-1","avatar_url":"http://i1.sndcdn.com/avatars-000000703825-1cyong-large.jpg?be751dc"},"stream_url":"http://api.soundcloud.com/tracks/13726996/stream","playback_count":343,"download_count":0,"favoritings_count":15,"comment_count":32,"attachments_uri":"http://api.soundcloud.com/tracks/13726996/attachments"}
							];
	pls.tags = ['tekno', 'minimal'];
	pls.title = 'Gorillatron';
	user.playlists.push(pls);
	user.save(function(err) {
		if(err) throw new Error(err)
		else res.send('Pl created')
	})
}); */


app.get('/user.:format?', ifUserAuthenticated, loadUser, function(req, res) {
	res.render('user', req.user.model);
});

app.get('/user/playlists.:format?', ifUserAuthenticated, loadUser, function(req, res) {
	res.render('playlists', req.user.model.playlists);
});

app.get('/user/playlists/:playlist_id/update.:format', ifUserAuthenticated, loadUser, function(req, res) {
	var playlistData = JSON.parse(req.query['playlistData']);
	var user = req.user.model;
	if(playlistData){
		user.playlists.id(req.params['playlist_id']).title = playlistData.title;
		user.playlists.id(req.params['playlist_id']).tags = playlistData.tags;
		user.playlists.id(req.params['playlist_id']).tracks = playlistData.tracks;
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
	} else if(!playlistModel) {
		res.render(null, {
			'error': 'Could not find the playlist to update'
		});
	} else {
		res.render(null, {
			'error': 'no playlistdata in post request'
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






