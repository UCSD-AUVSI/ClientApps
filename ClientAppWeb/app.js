
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , os = require('os');

var app = module.exports = express.createServer();
var pg = require('pg');
var fs = require('fs');
var http = require('http');
var io = require('socket.io').listen(app);
//Ground Station connection string
var pgstring = "pgsql://postgres:triton@192.168.1.90:5432/AUVSI_flightdata"

io.DEBUG = 0;//Hide all those debug statements in the console


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
app.get('/rest/flightdata', function(request,response) {
  var db = new pg.Client(pgstring);
  db.connect(function(err){
    db.query("select candidateid,targetid,description.description_id,shape,shapecolor,letter,lettercolor,target_x,target_y,top_x,top_y,timestamp,image_name from description inner join (select targetid,candidates.candidateid,description_id,image_name from unverified_targets inner join candidates on candidates.candidateid = unverified_targets.candidateid) as c on c.description_id = description.description_id", function(errors,resultset) {
      response.json([resultset.rows,"192.168.1.128"])
      db.end();
    });
  });
});
app.put('/rest/votes', function(request,response) {
  console.log('put /rest/votes');
  var targetid = request.param('targetid');
  var hasEntry = false;
  var db = new pg.Client(pgstring);
  db.connect(function(err){
    db.query("select * from verified_targets where targetid=$1",
      [targetid], function(errors,resultset) {
        if(resultset.length) {
          db.query("UPDATE description d " +
            "SET shape=$1, " +
                "shapecolor=$2, " +
                "letter=$3, " + 
                "lettercolor=$4, " +
                "target_x=$5, " +
                "target_y=$6, " +
                "top_x=$7, " +
                "top_y=$8  " +
            "WHERE d.description_id= " +
            "(SELECT description_id " +
            "FROM unverified_targets " +
            "WHERE targetid = $9)",
           [request.param('shape'),
            request.param('shapecolor'),
            request.param('letter'),
            request.param('lettercolor'),
            request.param('target_x'),
            request.param('target_y'),
            request.param('top_x'),
            request.param('top_y'),
            targetid],
            function(errors,updateresultset) {
              console.log(errors);
              response.send('success');
              db.end();
            });
        } else {
          db.query("UPDATE description d " +
              "SET shape=$1, " +
                  "shapecolor=$2, " +
                  "letter=$3, " +
                  "lettercolor=$4, " +
                  "target_x=$5, " + 
                  "target_y=$6, " +
                  "top_x=$7, " +
                  "top_y=$8 " +
              "WHERE d.description_id= $9", 
             [request.param('shape'),
              request.param('shapecolor'),
              request.param('letter'),
              request.param('lettercolor'),
              request.param('target_x'),
              request.param('target_y'),
              request.param('top_x'),
              request.param('top_y'),
              request.param('description_id')],
              function(errors,insertresultset) {
                db.query(
                  "INSERT INTO gps_position (lat, lon, alt)" +
                  "VALUES (-1000, -1000, -1000) " +
                  "RETURNING gps_id",
                  function(errors,gps_pos_insertresultset) {
                    console.log(gps_pos_insertresultset)
                    db.query("INSERT INTO verified_targets (targetid,center_gps_id) " +
                      "VALUES ($1,$2)",
                     [targetid,
                      gps_pos_insertresultset.rows[0]['gps_id']],
                      function(errors,innerinsertresultset) { 
                        console.log(innerinsertresultset);
                        response.send('success');
                        db.end();
                      });
                  });
              });
        }
      }); 
  });

});

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
