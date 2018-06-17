var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");
var datetime = require('node-datetime');


router.post('/insert',function(req,res){
	var can_serial = req.body.hardware_serial;
	var got_data = req.body.payload_fields;
	var got_time = datetime.create(req.body.metadata.time).getTime();
	
	var can_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial);
	
	db.query(can_sql, function(err, result) {
		if (err){
			console.log(err);
			res.json({"Status":"Error", "Message":"Database error"});
		}
		
		if (result.length > 0) {
			var from_db = result[0];
			var can_query = {"contect_weight":from_db.contect_weight+got_data.waste_amount, "last_hear_from":got_time};
			got_data['time'] = got_time;
			got_data['can_id'] = from_db.id;
			
			db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) {
				if (err){
					console.log(err);
					res.json({"Status":"Error", "Message":"Database error"});
				}
				
				db.query("UPDATE Trash_cans SET ? WHERE serial_nr ="+db.escape(can_serial), can_query, function(err, result) {
					if (err){
						console.log(err);
						res.json({"Status":"Error", "Message":"Database error"});
						return 0;
					}
					res.json({"Status":"Okay"});
					console.log("Cans/insert - done");
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
	db.query('SELECT * FROM Trash_cans', function (err, rows) {
		if (err) throw err;
		res.send(rows);
	});
});

router.put('', function(req,res){
	var got_data = req.body;
	if (got_data.hasOwnProperty("serial_nr") && got_data.hasOwnProperty("cans_type_id")) {
		var can_serial = got_data["serial_nr"];
		var can_type = got_data["cans_type_id"];
	}else{
		var msg = "Couldn't find either the can's serial nr orthe cans type";
		error_msg(res,msg, NULL);
	}	
	var lookup_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial);
	
	db.query(lookup_sql, function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		
		if (result.length < 1) {
			db.query('INSERT INTO Trash_cans SET ?', got_data, function(err, result) {
				if (err){
					var d_msg = "Database error handle: "+err;
					var msg = "Database error - Try again or contact IT-administrator";
					error_msg(res,msg, d_msg);
				}
				console.log("Can create with serial number: " + can_serial);
				res.json({'Status':"Okay", 'Massage':'Can created'});
			});
		}else{
			var msg = "Error";
			var dmsg = "User try to create a new can with a already used serial_number: " +can_serial;
			error_msg(res,msg, dmsg);
		}
	});
});

router.post('/update/:serial_nr', function(req,res){
	var serial_nr = req.params.serial_nr;
	var got_data = req.body;
	
	if (got_data.hasOwnProperty("id")) {
		delete got_data["id"];
	}
	if (got_data.hasOwnProperty("serial_nr")) {
		delete got_data["serial_nr"];
	}
	
	db.query("UPDATE Trash_cans SET ? WHERE serial_nr = '"+db.escape(serial_nr)+"'", got_data, function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		console.log("User has update can with serial number: " + serial_nr);
		res.json({'Status':"Okay", 'Massage':'Can updated'});
	});
	
});

router.delete('/remove/:serial_nr', function(req,res){
	var serial_nr = req.params.serial_nr;
	db.query("DELETE FROM Trash_cans WHERE serial_nr = '"+db.escape(serial_nr)+"'", function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		console.log("User has delete can with serial number: " + serial_nr);
		res.json({'Status':"Okay", 'Massage':'Can has been deleted'});
	});
});

function error_msg(res, msg, d_msg) {
	var c_msg = "User got a error! - Message: " + msg;
	console.error(c_msg);
	if (d_msg !== null) {
		d_msg = "More information:\n"+d_msg;
		console.error(d_msg);
	}
	res.json({"Status":"Error", "Message":msg});
}

module.exports = router;