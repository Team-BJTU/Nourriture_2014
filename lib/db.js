/*
** MongoDB
*/

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var config = require('./config');

var host = config.get('host');
var port = config.get('port');
var dbName = config.get('dbName');
var url = "mongodb://" + host + ':' + port + '/' + dbName;

exports.db = function() {
    var me = this;
    this.url = url;
    this.dbObject = null;
    MongoClient.connect(this.url, function(err, db) {
	if (err)
	    return (console.log("ERROR:", err));
	console.log("connected to", url);
	me.dbObject = db;
    });
}