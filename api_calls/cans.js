var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../db");
var datetime = require('node-datetime');


router.post('/insert',function(req,res){
	
	var query = {'serial_nr':"", "battery":"", "last_empty":""};
	
	var can_serial = req.body.hardware_serial;
	var data = req.body.payload_fields;
	var time = req.body.metadata.time;
	
	query['serial_nr'] = can_serial;
	query['battery'] = data.battery;
	query['last_empty'] = datetime.create(time).getTime();
	
	db.query('INSERT INTO Trash_cans SET ?', query, function(err, result) {
		if (err) throw err;
	});
	
	console.log(query);
	res.json({"Status":"Okay"});
});

router.get('', function(req,res){
	var answer = {};
	
	db.query('SELECT * FROM Trash_cans', function (err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			console.log(i);
			console.log(rows[i]);
			answer[i] = rows[i];
		}
		
		console.log("Done");
		console.log(answer);
		res.send(answer);
	});
})

module.exports = router;