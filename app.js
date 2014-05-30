var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  xmlparser = require('express-xml-bodyparser');

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

app.get('/test', function(req, res, next) {

  res.json(200);

});

server.listen(3000);