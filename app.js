var express = require('express')
  , app = express.createServer()

app.get('/', function(req, res){
  res.send([
      '<h1>Hello World</h1>'
  ].join('\n'));
});

app.listen(3000);
console.log('Express app started on port 3000');
