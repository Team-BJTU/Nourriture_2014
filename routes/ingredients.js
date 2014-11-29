var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('ingredientdb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'ingredientdb' database");
        db.collection('ingredients', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'ingredients' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving ingredient: ' + id);
    db.collection('ingredients', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('ingredients', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addIngredient = function(req, res) {
    var ingredient = req.body;
    console.log('Adding ingredient: ' + JSON.stringify(ingredient));
    db.collection('ingredients', function(err, collection) {
        collection.insert(ingredient, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateIngredient = function(req, res) {
    var id = req.params.id;
    var ingredient = req.body;
    console.log('Updating ingredient: ' + id);
    console.log(JSON.stringify(ingredient));
    db.collection('ingredients', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, ingredient, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating ingredient: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(ingredient);
            }
        });
    });
}

exports.deleteIngredient = function(req, res) {
    var id = req.params.id;
    console.log('Deleting ingredient: ' + id);
    db.collection('ingredients', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

var populateDB = function() {

    var ingredients = [
    {
     
    }];
 

    db.collection('ingredients', function(err, collection) {
        collection.insert(ingredients, {safe:true}, function(err, result) {});
    });

};