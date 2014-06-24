// Dependencies
var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  xmlparser = require('express-xml-bodyparser'),
  mysql = require('mysql'),
  easyxml = require('easyxml');

var path = __dirname;

// Set middlewares
function bootApplication(app) {
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(xmlparser());
  // EasyXML settings
  easyxml.configure({
    singularizeChildren: true,
    underscoreAttributes: true,
    rootElement: 'response',
    dateFormat: 'ISO',
    indent: 2,
    manifest: true
  });
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
      res.header('Content-Type', 'text/xml');
      var xml = easyxml.render({error: err});
      res.send(500, xml);
      return;
    }
    cb();
  }

  function checkIfEmpty(rows, res, cb){
    if(rows.length === 0){
      res.header('Content-Type', 'text/xml');
      var xml = easyxml.render({error: "Not found"});
      res.send(404, xml);
      return;
    }
    cb();
  }

  function checkParams(res, params, required, cb){
    var err = false;
    if(typeof params === 'undefined') {
      err = true;
    } else {
      for(var i=0; i<required.length; i++){
        if (typeof params[required[i]] === 'undefined'){
          err = true;
        }
      }
    }
    if(err){
      res.header('Content-Type', 'text/xml');
      var xml = easyxml.render({erorr : "Missing parameters"});
      res.send(400, xml);
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
        checkIfEmpty(rows, res, function(){
          var data = { countries : rows };
          res.header('Content-Type', 'text/xml');
          var xml = easyxml.render(data);
          res.send(200, xml);
        });
      });
    });
  });

  //POST /countries
  app.post('/countries', function(req, res, next){
    checkParams(res, req.body.opt, ['name', 'code', 'continent'], function(){
      var dataC = req.body.opt;
      var country  = {
        name: dataC.name[0],
        code: dataC.code[0],
        continent: dataC.continent[0]
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
  });

  //DELETE /countries/1
  app.delete('/countries/:countryId', function(req, res, next){
    connection.query('DELETE FROM country WHERE id = ?', req.params.countryId, function(err, result) {
      checkErrors(err, res, function(){
        var data = { message : 'Deleted' };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /places
  app.get('/places', function(req, res, next){
    var sqlQuery = 'SELECT p.*, t.name AS town_name, t.population, c.name AS country_name, c.code, c.continent ';
    sqlQuery += 'FROM place AS p, town AS t, country AS c ';
    sqlQuery += 'WHERE p.town_id = t.id AND t.country_id = c.id';
    if(typeof req.query.f !== 'undefined') {
      sqlQuery += " AND p.name LIKE '%" + req.query.f + "%'"
    }
    connection.query(sqlQuery, function(err, rows) {
      checkErrors(err, res, function(){
        var data = {
          places : []
        };
        for(var i=0; i<rows.length; i++){
          data.places[i] = {
            id: rows[i].id,
            name: rows[i].name,
            address: rows[i].address,
            description: rows[i].description,
            latitude: rows[i].latitude,
            longitude: rows[i].longitude,
            town: {
              name: rows[i].town_name,
              population: rows[i].population,
              country: {
                name: rows[i].country_name,
                code: rows[i].code,
                continent: rows[i].continent
              }
            }
          };
        }
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /places/1
  app.get('/places/:placeId', function(req, res, next){
    var sqlQuery = 'SELECT p.*, t.id AS town_id, t.name AS town_name, t.population, c.id AS country_id, c.name AS country_name, c.code, c.continent ';
    sqlQuery += 'FROM place AS p, town AS t, country AS c ';
    sqlQuery += 'WHERE p.town_id = t.id AND t.country_id = c.id AND p.id = ?';
    connection.query(sqlQuery, req.params.placeId, function(err, rows) {
      checkErrors(err, res, function(){
        checkIfEmpty(rows, res, function(){
          var place = rows[0];
          var data = {
            places : [{
              id: place.id,
              name: place.name,
              address: place.address,
              description: place.description,
              latitude: place.latitude,
              longitude: place.longitude,
              town: {
                id: place.town_id,
                name: place.town_name,
                population: place.population,
                country: {
                  id: place.country_id,
                  name: place.country_name,
                  code: place.code,
                  continent: place.continent
                }
              }
            }]
          };
          res.header('Content-Type', 'text/xml');
          var xml = easyxml.render(data);
          res.send(200, xml);
        });
      });
    });
  });

  //POST /places
  app.post('/places', function(req, res, next){
    checkParams(res, req.body.opt, ['name', 'address', 'description', 'latitude', 'longitude', 'town_id'], function(){
      var dataP = req.body.opt;
      var place  = {
        name: dataP.name[0],
        address: dataP.address[0],
        description: dataP.description[0],
        latitude: parseFloat(dataP.latitude[0]),
        longitude: parseFloat(dataP.longitude[0]),
        town_id: parseInt(dataP.town_id[0], 10)
      };
      connection.query('INSERT INTO place SET ?', place, function(err, result) {
        checkErrors(err, res, function(){
          var data = { placeId : result.insertId };
          res.header('Content-Type', 'text/xml');
          var xml = easyxml.render(data);
          res.send(201, xml);
        });
      });
    });
  });

  //PUT /places/1
  app.put('/places/:placeId', function(req, res, next){
    var place = {};
    if (typeof req.body.place.name !== 'undefined') place.name = req.body.place.name[0];
    if (typeof req.body.place.address !== 'undefined') place.address = req.body.place.address[0];
    if (typeof req.body.place.description !== 'undefined') place.description = req.body.place.description[0];
    if (typeof req.body.place.latitude !== 'undefined') place.latitude = req.body.place.latitude[0];
    if (typeof req.body.place.longitude !== 'undefined') place.longitude = req.body.place.longitude[0]
    if (typeof req.body.place.town_id !== 'undefined') place.town_id = req.body.place.town_id[0];
    connection.query('UPDATE place SET ? WHERE id = ?', [place, req.params.placeId], function(err, result) {
      checkErrors(err, res, function(){
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render({message:"Updated"});
        res.send(200, xml);
      });
    });
  });

  //DELETE /places/1
  app.delete('/places/:placeId', function(req, res, next){
    connection.query('DELETE FROM place WHERE id = ?', req.params.placeId, function(err, result) {
      checkErrors(err, res, function(){
        var data = { message : 'Deleted' };
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /towns
  app.get('/towns', function(req, res, next){
    var sqlQuery = 'SELECT t.*, c.name AS country_name, c.code, c.continent ';
    sqlQuery += 'FROM town AS t, country AS c ';
    sqlQuery += 'WHERE t.country_id = c.id';
    connection.query(sqlQuery, function(err, rows) {
      checkErrors(err, res, function(){
        var data = {
          towns : []
        };
        for(var i=0; i<rows.length; i++){
          data.towns[i] = {
            id: rows[i].id,
            name: rows[i].name,
            population: rows[i].population,
            country: {
              name: rows[i].country_name,
              code: rows[i].code,
              continent: rows[i].continent
            }
          };
        }
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render(data);
        res.send(200, xml);
      });
    });
  });

  //GET /towns/1
  app.get('/towns/:townId', function(req, res, next){
    var sqlQuery = 'SELECT t.*, c.id AS country_id, c.name AS country_name, c.code, c.continent ';
    sqlQuery += 'FROM town AS t, country AS c ';
    sqlQuery += 'WHERE t.country_id = c.id AND t.id = ?';
    connection.query(sqlQuery, req.params.townId, function(err, rows) {
      checkErrors(err, res, function(){
        checkIfEmpty(rows, res, function(){
          var data = {
            towns : [{
              id: rows[0].id,
              name: rows[0].name,
              population: rows[0].population,
              country: {
                id: rows[0].country_id,
                name: rows[0].country_name,
                code: rows[0].code,
                continent: rows[0].continent
              }
            }]
          };
          res.header('Content-Type', 'text/xml');
          var xml = easyxml.render(data);
          res.send(200, xml);
        });
      });
    });
  });

  //POST /towns
  app.post('/towns', function(req, res, next){
    checkParams(res, req.body.opt, ['name', 'population', 'country_id'], function(){
      var dataT = req.body.opt;
      var town  = {
        name: dataT.name[0],
        population: dataT.population[0],
        country_id: dataT.country_id[0]
      };
      connection.query('INSERT INTO town SET ?', town, function(err, result) {
        checkErrors(err, res, function(){
          var data = { townId : result.insertId };
          res.header('Content-Type', 'text/xml');
          var xml = easyxml.render(data);
          res.send(201, xml);
        });
      });
    });
  });

  //PUT /towns/1
  app.put('/towns/:townId', function(req, res, next){
    var town = {};
    if (typeof req.body.town.name !== 'undefined') town.name = req.body.town.name[0];
    if (typeof req.body.town.population !== 'undefined') town.population = req.body.town.population[0];
    if (typeof req.body.town.country_id !== 'undefined') town.country_id = req.body.town.country_id[0];
    connection.query('UPDATE town SET ? WHERE id = ?', [town, req.params.townId], function(err, result) {
      checkErrors(err, res, function(){
        res.header('Content-Type', 'text/xml');
        var xml = easyxml.render({message:"Updated"});
        res.send(200, xml);
      });
    });
  });

  //DELETE /towns/1
  app.delete('/towns/:townId', function(req, res, next){
    connection.query('DELETE FROM town WHERE id = ?', req.params.townId, function(err, result) {
      checkErrors(err, res, function(){
        var data = { message : 'Deleted' };
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