const express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');


var user_route = require('./api_calls/user');
var cans_route = require('./api_calls/cans');

const app = express();

var hotels = {"name":"John","age":30,"city":"New York"};



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/user', function (req, res) {
  //res.send('Got a GET request at /user\n')
  var jsonString = JSON.stringify(hotels);
  res.json(hotels);
  console.log('Got a GET request at /user - user: ' + req.body.user);
});

app.post('/user', function(req, res) {

  var name = req.body.user;
  var token = req.get('token');
  //console.log('Token: ' + token);

  var save = name + " | " + token;

  //writeFile(req);
  console.log(req.body);

  //writeFile(save);

  //console.log('Got a POST request at /user - user: ' + name);
  res.send('Ok ');
});


app.use('/api/user', user_route);
app.use('/api/cans', cans_route);


app.listen(3000, () => console.log('Example app listening on port 3000!'));

function writeFile(text) {
	var d = new Date();
	var log_time = d.getDate() + "/" + d.getMonth() + " - " + d.getFullYear() + " ";
	log_time = log_time + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
	var fil_name = 'Scoket' + d.getTime() + ".txt";

	var w_text = String(text);

	fs.appendFile(fil_name, w_text, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
}
