var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../db");
var datetime = require('node-datetime');


router.post('/insert',function(req,res){
	
	var can_serial = req.body.hardware_serial;
	var got_data = req.body.payload_fields;
	var got_time = datetime.create(req.body.metadata.time).getTime();
	
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
});

router.get('', function(req,res){
	var answer = {};
	
	db.query('SELECT * FROM Trash_cans', function (err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			answer[i] = rows[i];
		}
		res.send(answer);
	});
})

module.exports = router;