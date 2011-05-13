
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var dateFormat = require('./lib/dateformat');

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
//	client.query(
//	 'CREATE  TABLE '+POST+
//	'(id INT(11) AUTO_INCREMENT, '+
//	  'title VARCHAR(255), '+
//	 'text TEXT, '+
//	  'created DATETIME, '+
//	  'PRIMARY KEY (id))'
//	);
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
	  'SELECT * FROM '+POST+" ORDER BY created DESC",
	  function selectCb(err, results, fields) {
	    if (err) {
	      throw err;
	    }
		res.render('posts/index', {
		    title: 'Bejegyzések'
			,results: results
		  });
	  }
	);
});

app.get('/post/new', function(req, res){
  res.render('posts/new_post', {
    title: 'Új bejegyzés létrehozása'
  });
});

app.post('/post/new', function(req, res){
	var now = new Date();
	var fnow = dateFormat(now, "isoDateTime");
	var query = client.query(
	  'INSERT INTO '+POST+' '+
	  'SET title = ?, text = ?, created = ?',
	  [req.body.title, req.body.text, fnow ]
	);
	 res.redirect('/');
});

app.get('/post/:id', function(req, res){
	 var id = req.params.id;
	var post=client.query(
	'SELECT * FROM '+POST+" WHERE id='"+id+"' LIMIT 1",
	  function selectCb(err, results, fields) {
	    if (err) {
	      throw err;
	    }
		res.render('posts/show', {
			 title: results[0].title
			,post: results[0]
		  });
	  }
	);
});
app.get('/post/:id/edit', function(req, res){
	 var id = req.params.id;
	var post=client.query(
	'SELECT * FROM '+POST+" WHERE id='"+id+"'",
	  function selectCb(err, results, fields) {
	    if (err) {
	      throw err;
	    }
		res.render('posts/edit_post', {
			 title: results[0].title
			,post: results[0]
		  });
	  }
	);
});

app.post('/post/:id/edit', function(req, res){
	 var id = req.params.id;
	var query = client.query(
	      'UPDATE '+POST +
	      ' SET title = ?, text = ?' +
	      ' WHERE id='+id,
	      [req.body.title, req.body.text ]
	    );
	 res.redirect('/');
});
// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
