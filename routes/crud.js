/*
** CRUD ROUTE GENERIC
*/

var ObjectId = require('mongodb').ObjectID;

var mapping = {
    'GET': get,
    'POST': post,
    'PUT': put,
    'DELETE': del,
};

var mappingCollection = {
    'ingredient': true,
    'recipe': true,
    'country': true,
    'user': true
};

exports.crud = function(req, res) {
    var method = req.method;
    var collection = req.params.collection;
    if (mapping[method] != undefined && mappingCollection[collection] == true) {
	mapping[method](collection, {body: req.body, query: req.query, params: req.params}, function(err, results) {
	    if (err)
		res.send(500, err);
	    res.send(200, results);
	});
    } else {
	res.send(500, {'err': 'collection "' + collection + '" does not exist.'});
    }
}

function put(collection, query, callback) {
    var id = query.body._id
    var db = GLOBAL.db.dbObject.collection(collection);

    delete (query.body._id);
    console.log('query', query.body);
    if (id) {
	if (id.length == 12 || id.length == 24)
	    id = new ObjectId(id);
	db.update({_id: id}, query.body, function(err, items) {
	    if (!err)
	  	console.log(collection + ' update ' + id);
	    callback(err, items);
	});
    } else {
	callback({'err': 'put error: _id required'}, null);
    }
};

function del(collection, query, callback) {
    var id = query.body._id;
    var db = GLOBAL.db.dbObject.collection(collection);
    if (id && (id.length == 12 || id.length == 24))
        id = new ObjectId(id);

    db.remove({"_id": id}, function(err, items) {
    	if (items == '1') {
    	    items = {'deleted': 'true'};
    	    console.log(collection + ' deleted ' + id);
    	}
        else if (typeof items != 'object')
            items = {};
        callback(err, items);
    });
};

function post(collection, query, callback) {
    var db = GLOBAL.db.dbObject.collection(collection);
    if (query.body) {
	db.insert(query.body, {safe: true}, function(err, results) {
	    if (!err && results && results.length > 0)
		console.log(collection + ' inserted ' + results[0]._id);
	    callback(err, results);
	});
    } else {
	callback({'inserted': 'false'}, null);
    }
};

function get(collection, query, callback) {
    var errors = [];
    var results = [];
    var db = GLOBAL.db.dbObject.collection(collection);
    var pageSize = query.query['$limit'] ? parseInt(query.query['$limit']) : 20;
    var pageNumber = query.query['$page'] ? parseInt(query.query['$page']) : 1;
    var sortQuery = query.query['$sort'] ?  JSON.parse(query.query['$sort']) : {};
    var skip = query.query['$skip'] ? query.query['$skip'] : pageSize * (pageNumber - 1);
    var id = query.query._id;

    if (id && (id.length == 12 || id.length == 24))
        query.query._id = new ObjectId(query.query._id);
    if (skip)
        delete (query.query['$skip']);
    if (pageSize)
	delete (query.query['$limit']);
    if (pageNumber)
    	delete (query.query['$page']);
    if (sortQuery)
    	delete (query.query['$sort']);

    console.log(collection + ' get ' + JSON.stringify(query.query));
    var stream = db.find(query.query).sort(sortQuery).skip(skip).limit(pageSize).stream();

    stream.on('data', function(data) {
        results.push(data);
    }).on('close', function() {
        if (errors.length <= 0)
            errors = null;
        callback(errors, results);
    }).on('error', function(err) {
        errors.push(err);
    });
};