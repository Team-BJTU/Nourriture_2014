/*
**********************************************************
********************** GENERIC OBJECT **********************
**********************************************************
** entities (object ex: {title: 'Test', tags: "danse, music"})
** dbObject (object db.collection('BOARD'))
** insertInDb (boolean)
** callback (function)
*/

exports.Object = function (entities, dbObject, insertInDb, callback) {
    this.Object = entities;

    this.dbObject = dbObject;
    if (insertInDb === true) {
	this.updateOrInsertFolder(callback);
    }
};

exports.Object.prototype.insertObject = function(callback) {
    this.dbObject.update(this.Object, {safe: true}, function(err, doc) {
        if (err && typeof callback === 'function')
            callback(err);
        else
            callback('Object updated');
    });
};

exports.Object.prototype.insertObject = function(callback) {
    this.dbObject.save(this.Object, {safe: true}, function(err, doc) {
        if (err && typeof callback === 'function')
            callback(err);
        else
            callback('Object inserted');
    });  
};

exports.Object.prototype.updateOrInsertObject = function(callback) {
    var me = this;

    this.dbObject.findOne({user: this.Object.user, title: this.Object.title}, function(err, result) {
	if (result == null)
            me.insertObject(callback);
	else
            callback(result);
    });
};