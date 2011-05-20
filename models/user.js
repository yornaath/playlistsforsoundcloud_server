




var User = function(host, port) {
	this.mongoose = require('mongoose');
	this.mongoose.conect(host);
	this.schema = new this.mongoose.Schema({
		
	});
};




/*


var Db = require('mongodb').Db,
		Connection = require('mongodb').Connection,
  	Server = require('mongodb').Server,
  	// BSON = require('mongodb').BSONPure;
  	BSON = require('mongodb').BSONNative;;

var UserManager = function(host, port) {
	this.db = new Db('scpldb', new Server(host, port, {native_parser:true, auto_reconnect: true}), {});
	this.db.open(function(err, db) {
	});
};

UserManager.prototype.getCollection = function(callback) {
	this.db.collection('users', function(err, user_collection) {
		if(err) callback(err);
		else callback(null, user_collection);
	});
};

UserManager.prototype.save = function(users, callback) {
	this.getCollection(function(err, user_collection) {
		if(err)	callback(err, null)
		else {
			user_collection.save(users, function() {
				callback(null, users);
			});
		}
	});
};

UserManager.prototype.update = function(user, callback) {
	this.getCollection(function(err, user_collection) {
		if(err)	callback(err, null)
		else {
			user_collection.save({"_id": user["_id"]}, user, function() {
				callback(null, user);
			});
		}
	});
};

UserManager.prototype.findAll = function(callback) {
	this.getCollection(function(err, user_collection) {
		if(err) callback(err)
		else {
			user_collection.find(function(err, cursor) {
				if(err) callback(err)
				else {
					cursor.toArray(function(err, results) {
						if(err) callback(err)
						else callback(null, results);
					});
				}
			});
		}
	});
};


UserManager.prototype.findById = function(id, callback) {
  this.getCollection(function(err, user_collection) {
		if(err) callback(err)
		else {
			user_collection.find({_id : id}, function(err, cursor) {
				if(err) callback(err)
				else {
					cursor.toArray(function(err, results) {
						if(err) callback(err)
						else callback(null, results);
					});
				}
			});
		}
	});
};

*/
exports.UserManager = UserManager;