var cf = require("cloudfoundry"),
		mongoose = require('mongoose'),
		mongoConfig = cf.getServiceConfig("mongodb-2dfa1");
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;
		



var Playlists = new Schema({
	title: String,
	tags: [String],
	createdAt: {type: Date, default: Date.now},
	tracks: {}
});

var User = new Schema({
	_id: ObjectId,
	soundcloud_id: Number,
	playlists: [Playlists]
});

mongoose.connect('mongo://'
									+ mongoConfig.username
									+ ':' + mongoConfig.password
									+ '@' + mongoConfig.hostname
									+ ':' + mongoConfig.port
									+ '/' + mongoConfig.db
									+ '?auto_reconnect=true');

mongoose.model('User', User);

var User = mongoose.model('User');

module.exports = User;