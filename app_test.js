const express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var db = require("./db");

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
/*
app.post('/', function(req,res) {
	var can_serial = req.body.hardware_serial;
	var got_data = req.body.payload_fields;
	var got_time = datetime.create(req.body.metadata.time).getTime();
	
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("Connect from: " + ip);
	
	var can_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial);
	
	db.query(can_sql, function(err, result) {
		if (err){
			throw err;
			res.json({"Status":"Error"});
		}
		
		if (result.length > 0) {
			var from_db = result[0];
			var can_query = {"contect_weight":from_db.contect_weight+got_data.waste_amount, "last_hear_from":got_time};
			got_data['time'] = got_time;
			got_data['can_id'] = from_db.id;
			
			db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) {
				if (err){
					throw err;
					res.json({"Status":"Error"});
				}
				
				db.query("UPDATE Trash_cans SET ? WHERE serial_nr = '"+can_serial+"'", can_query, function(err, result) {
					if (err){
						throw err;
						res.json({"Status":"Error"});
					}
					res.json({"Status":"Okay"});
				});
			});
		}else{
			var msg = "Could not find following Can Serialnr: " + can_serial;
			console.error(msg);
			res.json({"Status":"Error", "Message":msg});
		}
	});
});*/

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
