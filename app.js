// Dependencies
var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  xmlparser = require('express-xml-bodyparser'),
  mysql = require('mysql'),
  easyxml = require('easyxml');

var path = __dirname;

// EasyXML settings
easyxml.configure({
  singularizeChildren: true,
  underscoreAttributes: true,
  rootElement: 'response',
  dateFormat: 'ISO',
  indent: 2,
  manifest: true
});

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

  //GET /countries
  app.get('/countries', function(req, res, next){
    connection.query('SELECT * FROM country', function(err, rows) {
      checkErrors(err, res, function(){
        var data = { countries : rows };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /countries/1
  app.get('/countries/:countryId', function(req, res, next){
    connection.query('SELECT * FROM country WHERE id = '+ req.params.countryId, function(err, rows) {
      checkErrors(err, res, function(){
        var data = { countries : rows };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /places
  app.get('/places', function(req, res, next){
    connection.query('SELECT * FROM place', function(err, rows) {
      checkErrors(err, res, function(){
        var data = { places : rows };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /places/1
  app.get('/places/:placeId', function(req, res, next){
    connection.query('SELECT * FROM place WHERE id = '+ req.params.placeId, function(err, rows) {
      checkErrors(err, res, function(){
        var data = { places : rows };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /towns
  app.get('/towns', function(req, res, next){
    connection.query('SELECT * FROM town', function(err, rows) {
      checkErrors(err, res, function(){
        var data = { towns : rows };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /towns/1
  app.get('/towns/:townId', function(req, res, next){
    connection.query('SELECT * FROM town WHERE id = '+ req.params.townId, function(err, rows) {
      checkErrors(err, res, function(){
        var data = { towns : rows };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

}

// Bootstrap application
bootApplication(app);
bootDatabase(app);

server.listen(3000);