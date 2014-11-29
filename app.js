var express = require('express'),
    ingredient = require('./routes/ingredients');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); 
var app = express();
 
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(cookieParser());
 
app.get('/ingredients', ingredient.findAll);
app.get('/ingredients/:id', ingredient.findById);
app.post('/ingredients', ingredient.addIngredient);
app.put('/ingredients/:id', ingredient.updateIngredient);
app.delete('/ingredients/:id', ingredient.deleteIngredient);
 
app.listen(3000);
console.log('Listening on port 3000...');
