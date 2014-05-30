// Dependencies
var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  xmlparser = require('express-xml-bodyparser'),
  sql = require('sql'),
  mysql = require('mysql');

// Middlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

// SQL connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root'
});

connection.connect(function(err) {
  if (err) {
    console.error('[SQL] error connecting: ' + err.stack);
    return;
  }

  console.log('[SQL] Connected as id ' + connection.threadId);
});

// Controllers
app.get('/test', function(req, res, next) {

  var town = sql.define({
    name: 'town',
    columns: ['id', 'name', 'population', 'country_id']
  });

  var query = town
    .select(town.id)
    .from(town)
    .where(
      town.name.equals('paris')
    ).toQuery();

  console.log(query.text);

  connection.query(query.text, function(err, rows) {
    if(err){
      res.send(500, { msg: "ERROR!", err: err });
      return;
    }

    res.send(200, { msg: "OK!", rows: rows});
  });

});

server.listen(3000);