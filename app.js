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

  //POST /countries
  app.post('/countries', function(req, res, next){
    if(
      typeof req.body.country === 'undefined'
      || (typeof req.body.country.name === 'undefined' || req.body.country.name.length === 0)
      || (typeof req.body.country.code === 'undefined' || req.body.country.code.length === 0)
      || (typeof req.body.country.continent === 'undefined' || req.body.country.continent.length === 0)
    ){
      res.send(400, {message: "Missing parameters"});
      return;
    }
    var country  = {
      name: req.body.country.name[0],
      code: req.body.country.code[0],
      continent: req.body.country.continent[0]
    };
    connection.query('INSERT INTO country SET ?', country, function(err, result) {
      checkErrors(err, res, function(){
        var data = { countryId : result.insertId };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(201, xml);
      });
    });
  });

  //GET /places
  app.get('/places', function(req, res, next){
    var sqlQuery = 'SELECT * FROM place';
    if(typeof req.query.f !== 'undefined') {
      sqlQuery += " WHERE place.name LIKE '%" + req.query.f + "%'"
    }
    connection.query(sqlQuery, function(err, rows) {
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