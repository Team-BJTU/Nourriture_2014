var ObjectId = require('mongodb').ObjectID;

function deleteUselessField(data) {
    delete (data.userId);
    delete (data.countryId);
    return (data);
}

function updateIngredients(data, callback) {
    console.log('updateIngredients');
    if (data.ingredients) {
	var cpt = 0;
	var errors = [];
	var results = [];
	if (ingredientsLength == 0)
	    return callback(null, data);
	data.ingredients = data.ingredients.split(',');
	var ingredientsLength = data.ingredients ? data.ingredients.length : 0;
	while (ingredientTmp = data.ingredients.shift())
	{
	    var ingredientCollection = GLOBAL.db.dbObject.collection('ingredient');
	    if (ingredientTmp && (ingredientTmp.length == 12 || ingredientTmp.length == 24))
		ingredientTmp = new ObjectId(ingredientTmp);
	    ingredientCollection.findOne({'_id': ingredientTmp}, function(err, res) {
		if (err) {
		    errors.push(err);
		} if (res) {
                    results.push(deleteUselessField(res));
		}
		++cpt;
		if (cpt >= ingredientsLength) {
		    if (errors.length == 0)
			errors = null;
                    return callback(err, results);
		}
	    });
	}
    } else {
	callback(null, null);
    }
}

function updateCountry(data, callback) {
    console.log('updateCountry');
    var countryCollection = GLOBAL.db.dbObject.collection('country');
    if (data.countryId && (data.countryId.length == 12 || data.countryId.length == 24))
        data.countryId = new ObjectId(data.countryId);
    countryCollection.findOne({'_id': data.countryId}, function(err, res) {
        callback(err, res);
    });
}

function updateUser(data, callback) {
    console.log('updateUser');
    if (data.userId && (data.userId.length == 12 || data.userId.length == 24))
        data.userId = new ObjectId(data.userId);
    var userCollection = GLOBAL.db.dbObject.collection('user');
    userCollection.findOne({'_id': data.userId}, function(err, res) {
        callback(err, res);
    });
}

function getData(data, iterator, callback) {
    updateIngredients(data, function(err, ingredients) {
	if (err) {
	    callback(err, null);
	} else {
	    if (ingredients)
		data.ingredients = ingredients
	    updateCountry(data, function(err, country) {
		if (err) {
		    callback(err, null);
		} else {
		    if (country)
			data.country = country;
		    updateUser(data, function(err, user) {
			if (user)
			    data.user = user;
			callback(err, iterator, deleteUselessField(data));
		    });
		}
	    });
	}
    });
}

exports.get = function(datas, callback) {
    var cpt = 0;
    var errors = [];
    var results = datas;
    var iterator = 0;
    var datasLength = datas.length;
    if (!datas || datasLength == 0)
	return callback(null, datas);
    var i = 0;
    while (data = datas.shift()) {
	getData(data, iterator, function(err, iterator, dataGet) {
	    if (err) {
		errors.push(err);
	    }
	    results[iterator] = dataGet;
	    ++cpt;
	    if (cpt >= datasLength) {
		if (errors.length <= 0)
		    errors = null;
		callback(errors, results);
	    }
	});
	++iterator;
    }

};