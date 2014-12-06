/*
** Module dependencies.
*/
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

var crud = require('../routes/crud.js');

var index = require('../routes/index.js');
var get = require('../routes/get.js');

var db = require('../../lib/db.js').db;
GLOBAL.db = new db();

/*
** all environments
*/

app.set('port', process.env.PORT || 3000);
app.use(express.bodyParser());

app.get('/', index.index);

/*
** CRUD REST OPERATION
*/
app.all('/crud/:collection/*', crud.crud);

/*
** GET OPERATION
*/
app.get('/:collection/?', get.get);

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});