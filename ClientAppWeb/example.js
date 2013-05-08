var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello Worldsdfs\n');
}).listen(9000, 'localhost');
console.log('Server running at http://127.0.0.1:1337/');

app.get('/', function(request, response) {
	response.redirect('/app');
});
 // GET.   
 var options = {  
           host: 'localhost',   
           port: 9000,   
           path: '/user/suwanny'  
      };   
 var req = http.get(options, function(res) {  
      console.log("Got response: " + res.statusCode);   
      res.on('data', function(chunk) {  
           console.log("Body: " + chunk);   
      });   
 }).on('error', function(e) {  
      console.log("Got error: " + e.message);   
 });  