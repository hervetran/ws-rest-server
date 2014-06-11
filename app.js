// Dependencies
var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  xmlparser = require('express-xml-bodyparser'),
  mysql = require('mysql');

var path = __dirname;

// Set middlewares
function bootApplication(app) {
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(xmlparser());
}

// Initialize database connection
function bootDatabase(app, cb) {

  // SQL connection
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'places'
  });

  connection.connect(function(err) {
    if (err) {
      console.error('[SQL] error connecting: ' + err.stack);
      return;
    }

    console.log('[SQL] Connected as id ' + connection.threadId);

    bootControllers(app, connection);

  });

}

// Set routes and controllers
function bootControllers(app, connection){

  function checkErrors(err, res, cb){
    if(err) {
      res.send(500, { err: err });
      return;
    }
    cb();
  }

  app.get('/countries', function(req, res, next){
    connection.query('SELECT * FROM country', function(err, rows) {
      checkErrors(err, res, function(){
        res.send(200, { rows: rows});
      });
    });
  });

  app.get('/countries/:countryId', function(req, res, next){
    connection.query('SELECT * FROM country WHERE id = '+ req.params.countryId, function(err, rows) {
      checkErrors(err, res, function(){
        res.send(200, { rows: rows});
      });
    });
  });

}

// Bootstrap application
bootApplication(app);
bootDatabase(app);

server.listen(3000);