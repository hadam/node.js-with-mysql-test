
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Mysql 
var Client = require('mysql').Client,
    client = new Client();
    client.user = 'root'; 
    client.password = '';
	DATABASE = 'simple_blog_nodejs',
 	POST = 'post';
    //client.host=''; //csak akkor ha nem localhost
    //client.port='5673'; //csak akkor ha nem 3306 standard

    client.connect();
	//adatbázis létrahozása
	client.query('CREATE DATABASE '+DATABASE, function(err) {
	  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
	    throw err;
	  }
	});
	
	//adatbázis használatba vétele :)
	client.query('USE '+DATABASE);
	
	//tábla létrehozása
	//client.query(
	//  'CREATE  TABLE '+POST+
	// '(id INT(11) AUTO_INCREMENT, '+
	//  'title VARCHAR(255), '+
	//  'text TEXT, '+
	//  'created DATETIME, '+
	//  'PRIMARY KEY (id))'
	//);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
	
	var posts=client.query(
	  'SELECT * FROM '+POST,
	  function selectCb(err, results, fields) {
	    if (err) {
	      throw err;
	    }
		res.render('index', {
		    title: 'Bejegyzések'
			,results: results
		  });
	    console.log(results);
	    console.log(fields);
	    client.end();
	  }
	);
	
  
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
