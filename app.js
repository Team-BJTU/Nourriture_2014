/*var express = require('express')
  , app = express.createServer()

app.get('/', function(req, res){
  res.send([
      '<h1>Hello World</h1>'
  ].join('\n'));
});

app.listen(8080);
console.log('Express app started on port 8080');
*/

var express = require('express');
var express = express();

app.get('/', function(req, res){
	res.send('Hello world')
});

app.listen(process.env.PORT || 5000);

module.exports = app;
