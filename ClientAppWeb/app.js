
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , os = require('os');

var app = module.exports = express.createServer();
var pg = require('postgres/lib/postgres-pure.js');
var fs = require('fs');
var http = require('http');
var io = require('socket.io').listen(app);
//old
//var pgstring = "pgsql://postgres:postgrespass@localhost:5432/AUVSI_flightdata";
/******
new

need to insert some dummy data into this new database
*/
//var pgstring = "pgsql://postgres:postgrespass@localhost:5432/AUVSI_data"


//Ground Station connection string
var pgstring = "pgsql://postgres:triton@localhost:5432/AUVSI_flightdata"

io.DEBUG = 0;//Hide all those debug statements in the console
/*var faye = require('faye');
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.attach(app);*/

//pg.DEBUG = 1;
/* Initializes a connection to the database.
DB connections are of the form:

pgsql://user:password@hostname:port/databasename

*/


// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs.html');
  app.register('hbs.html', require('hbs'));
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
app.get('/', function(req,res) {
	var data= 	{
					title: 'Client App'
				}
  
	res.render('index', data);
  console.log(req.header('host'));
});
app.get('/index', function(req,res) {
	var data= 	{
					title: 'Client App'
				}
	res.render('index', data);
});
app.get('/index-readonly', function(req,res) {
  var user = { name: 'tjor' };
  var data=   {
          title: 'Client App-readonly',
          readonly: true
  };
  res.render('index', data);
  //send the index page but also send a {readonly: true} value.
});

//REST API
app.get('/rest/flightdata', function(request,response) {
	var results = '';
	var db = new pg.connect(pgstring);
	//old
  /*db.query("SELECT * FROM computeroutput", function (errors, resultset) {
    
		//onsole.log(resultset);
	    results = resultset;
	    response.send(results);
	});*/
  //new
  console.log('/rest/flightdata/');
  db.query("select candidateid,targetid,description.description_id,shape,shapecolor,letter,lettercolor,target_x,target_y,top_x,top_y,timestamp,image_name from description inner join (select targetid,candidates.candidateid,description_id,image_name from unverified_targets inner join candidates on candidates.candidateid = unverified_targets.candidateid) as c on c.description_id = description.description_id", function(errors,resultset) {
    console.log('select the data');
    console.log(errors);
    var host = request.header('host');
    var hostIP = host.substring(0,host.indexOf(':'));

    response.send([resultset,hostIP]);
    console.log('response sent');
  });
	db.close();
});
app.put('/rest/votes', function(request,response) {
  console.log('put /rest/votes');
  var targetid = request.param('targetid');
  var hasEntry = false;
  var db = new pg.connect(pgstring);
  //old
  /*db.query("SELECT candidateid FROM votes WHERE candidateid=?",request.param('candidateid'), function(errors,resultset) {

      console.log(resultset);

      if(resultset.length !== 0) {
        hasEntry = true;
      }
      if(hasEntry) {
        db.query("UPDATE votes SET shape=?,shapecolor=?,letter=?,lettercolor=?,targetx=?,targety=?,topoftargetx=?,topoftargety=?,userid=? WHERE candidateid=?",request.param('shape'),request.param('shapecolor'),request.param('letter'),
            request.param('lettercolor'),request.param('targetx'),request.param('targety'),request.param('topoftargetx'),request.param('topoftargety'),
            request.param('userid'),request.param('candidateid'),function(errors,resultset) {
            
            console.log('update');
            console.log(errors);
            //console.log(resultset);
            response.send('success');
        });
      } else {
        db.query("INSERT INTO votes(candidateid,shape,shapecolor,letter,lettercolor,targetx,targety,topoftargetx,topoftargety,userid)"+
          " VALUES(?,?,?,?,?,?,?,?,?,?)",request.param('candidateid'),request.param('shape'),request.param('shapecolor'),request.param('letter'),
            request.param('lettercolor'),request.param('targetx'),request.param('targety'),request.param('topoftargetx'),request.param('topoftargety'),
            request.param('userid'),function(errors,resultset) {
            console.log('inserttt');
            console.log(errors);
            response.send('success');
        });
    }
  });*/
  //new
  db.query("select * from verified_targets where targetid=?",targetid, function(errors,resultset) {

      if(resultset.length !== 0) {
        hasEntry = true;
      }
      if(hasEntry) {
        console.log('update');
        db.query("UPDATE description d SET shape=?,shapecolor=?,letter=?,lettercolor=?,target_x=?,target_y=?,top_x=?,top_y=? WHERE d.description_id= (select description_id from unverified_targets where targetid = ?)",request.param('shape'),request.param('shapecolor'),request.param('letter'),
            request.param('lettercolor'),request.param('target_x'),request.param('target_y'),request.param('top_x'),request.param('top_y'),targetid,function(errors,updateresultset) {
            //select * from description where description.description_id = (select description_id from unverified_targets where targetid = 2);
            console.log(errors);
            response.send('success');
        });
      } else {

        console.log('update insert insert');


        //THIS ISNT INSERTING CORRECTLY FOR SOME REASON! NOTHING SHOWS UP IN DESCRIPTION, BUT THERE IS NO ERROR. THE ID VALUES SEEM CORRECT

        db.query("UPDATE description d SET shape=?,shapecolor=?,letter=?,lettercolor=?,target_x=?,target_y=?,top_x=?,top_y=? WHERE d.description_id= ?",request.param('shape'),request.param('shapecolor'),request.param('letter'),
            request.param('lettercolor'),request.param('target_x'),request.param('target_y'),request.param('top_x'),request.param('top_y'),request.param('description_id'),function(errors,insertresultset) {
              console.log(insertresultset)
            //console.log(insertresultset[0]['description_id']);
          db.query("INSERT INTO gps_position (lat, lon, alt) VALUES (-1000, -1000, -1000) RETURNING gps_id",function(errors,gps_pos_insertresultset) {


                db.query("INSERT INTO verified_targets (targetid,center_gps_id) VALUES (?,?)",targetid,gps_pos_insertresultset[0]['gps_id'],function(errors,innerinsertresultset) { // CENTER_GPS_ID WILL CAUSE FAILURE
                  console.log(innerinsertresultset);
                  response.send('success');
                });
          });
        });



        //We never need to insert into description. There is always a row for each image I get.
        /*db.query("INSERT INTO description (shape,shapecolor,letter,lettercolor,target_x,target_y,top_x,top_y) VALUES(?,?,?,?,?,?,?,?) RETURNING description_id",request.param('shape'),request.param('shapecolor'),request.param('letter'),
            request.param('lettercolor'),request.param('target_x'),request.param('target_y'),request.param('top_x'),request.param('top_y'),function(errors,insertresultset) {
            console.log('inserttt');

            console.log(errors);
            console.log("insert resultset");
            console.log(insertresultset[0]['description_id']);

            db.query("INSERT INTO verified_targets (targetid,descriptionid,center_gps_id) VALUES (?,?,1)",targetid,insertresultset[0]['description_id'],function(errors,resultset) {
              console.log('inner inserttt');

              console.log(request.param('targetid'));
              console.log(request.param('description_id'));

              console.log(errors);
              response.send('success');
            });
        });*/
      }
    
  });


  
  
});

//old
/*app.put('/rest/testinsert', function(request,response) {
  var db = new pg.connect("pgsql://postgres:postgrespass@localhost:5432/AUVSI_flightdata");
  var timestamp = new Date().getTime();
  db.query("INSERT INTO computeroutput(shape,shapecolor,letter,lettercolor,timestamp,imagename,originx,originy) VALUES('square','pink','z','yellow',"+timestamp+",'j_square4.png',0,0)", function(errors,resultset) {
    response.send('success');
  });
  db.close();
});*/
app.put('/rest/testinsert', function(request,response) {
  var db = new pg.connect(pgstring);
  var timestamp = new Date().getTime();
  db.query("INSERT INTO description(shape,shapecolor,letter,lettercolor,timestamp,target_x,target_y) VALUES('square','pink','z','yellow',"+timestamp+",0,0)", function(errors,resultset) {
    response.send('success');
  });
  db.close();
});


//socket.io
io.sockets.on('connection',function(socket) {
  socket.on('clientapp-imageview:setcurrentimg', function(data) {
    console.log('server:setcurrentimg');
    io.sockets.emit('clientapp-imageview:setcurrentimg', data);
  });
  socket.on('clientapp-imageview:nextimage', function(data) {
    console.log('server:nextimage');
    io.sockets.emit('clientapp-imageview:nextimage', data);
  });
  socket.on('clientapp-imageview:previmage', function(data) {
    console.log('server:previmage');
    io.sockets.emit('clientapp-imageview:previmage', data);
  });
  //socket.emit('loadnewimages', {hello: 'world'});
});







//http://localhost:3000/images/g_square.png
function images(res) {
    fs.readdir("./public/flightdata", function(err, files) {
    	console.log('in');
        if (err) throw err;
        console.log('after err');
        var images = [];

        files.forEach(function(file) {
        	console.log('each');
            var dot = file.lastIndexOf(".") + 1,
                ext = file.substr(dot, file.length),
                fmt = ["jpg", "png", "gif"];

            if (fmt.indexOf(ext) > -1) {
              images.push(file);
            }
        });
        console.log('before show images');
        console.log(images);

        //showImages(results);
    });

    function showImages(images) {
        //res.writeHead(200, {"Content-Type" : "text/html"});
        for (i = 0; i < images.length; i++) {
            res.write("<img src='http://127.0.0.1:8888/img/" + images[i] + "' />");
        }
        res.end();
    }
}

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);




//New Database Schema
/*
Read from unverified_targets and description
Add new rows to verified_targets and modify description appropriately


//for test insert, first fill candidates, then description, then unverified_targets
*/