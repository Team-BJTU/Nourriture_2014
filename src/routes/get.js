var ObjectId = require('mongodb').ObjectID;
var manageData = require('./manageData.js');

var classicGet = function(collection, query, callback) {
    var errors = [];
    var results = [];
    var db = GLOBAL.db.dbObject.collection(collection);
    var pageSize = query['$limit'] ? parseInt(query['$limit']) : 20;
    var pageNumber = query['$page'] ? parseInt(query['$page']) : 1;
    var sortQuery = query['$sort'] ?  JSON.parse(query['$sort']) : {};
    var skip = query['$skip'] ? query['$skip'] : pageSize * (pageNumber - 1);
    var id = query._id;

    if (id && (id.length == 12 || id.length == 24))
        query._id = new ObjectId(query._id);
    if (skip)
        delete (query['$skip']);
    if (pageSize)
	delete (query['$limit']);
    if (pageNumber)
    	delete (query['$page']);
    if (sortQuery)
    	delete (query['$sort']);

    var stream = db.find(query).sort(sortQuery).skip(skip).limit(pageSize).stream();

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

var getCountry = function(query, callback) {
    classicGet('country', query, callback);
};

var getUser = function(query, callback) {
    classicGet('user', query, callback);
};

var getIngredient = function(query, callback) {
    classicGet('ingredient', query, function(err, res) {
	if (err) {
	    callback(null, err);
	} else {
	    manageData.get(res, callback);
	}
    });
};

var getRecipe = function(query, callback) {
    classicGet('recipe', query, function(err, res) {
	if (err) {
	    callback(null, err);
	} else {
	    manageData.get(res, callback);
	}
    });
};

var mapping = {
    'recipe': getRecipe,
    'country': getCountry,
    'user': getUser,
    'ingredient': getIngredient
};

exports.get = function(req, res) {
    console.log('GET');
    var collection = req.params.collection;
    var iterator = 0;
    for (param in mapping) {
	if (param == collection) {
	    mapping[param](req.query, function(err, result) {
		console.log('RESULT', result);
		if (err) {
		    res.send(500, err);
		} else {
		    res.send(result);
		}
	    });
	} else {
	    ++iterator;
	}
    }
    if (iterator == mapping.length)
	res.send(500, {"error": "collection " + collection + " does not exist."});
};
