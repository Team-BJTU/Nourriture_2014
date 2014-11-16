var express     = require('express')
  //, db          = require('./db')
  , bodyParser  = require('body-parser');
var app         = express()
  , port        = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(require('./controllers'));
app.listen(port);
console.log('Server listening on port ' + port);
