var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../db");
var datetime = require('node-datetime');


router.get('', function(req,res){
	db.query("SELECT * FROM Trash_waste_log", function(err, result){
		res.json(result);
	});
});

router.get('/by_user/:id', function(req,res){
	var id = req.params.id;
	db.query("SELECT * FROM Trash_waste_log WHERE user_id ="+db.escape(id)+"", function(err, result){
		if (err) throw err;
		res.json(result);
	});
});

router.get('/by_can/:id', function(req,res) {
	var id = req.params.id;
	db.query("SELECT * FROM Trash_waste_log WHERE can_id ="+db.escape(id)+"", function(err, result){
		if (err) throw err;
		res.json(result);
	});
});

router.put('/create', function(req,res) { ///// IKKE FÆRDIG ENDNU!!!!!!!!!
	var got_data = req.body;
	if (!got_data.hasOwnProperty('user_id') || !got_data.hasOwnProperty("can_id") || !got_data.hasOwnProperty('waste_amount')) {
		var msg = "The api can't beused with out the values for: user_id, can_id and waste_amount";
		error_msg(res, msg);
	}
	if (!got_data.hasOwnProperty('user_id')) {
		got_data["time"] = datetime.create().getTime();
	}else{
		got_data["time"] = datetime.create(got_data["time"]).getTime();
	}
	
	db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		console.log("Have create a log in the waste log");
		res.json({"Status":"Okay", "Message":"The log has been created"});
	});
});

router.post('/update:id', function(req, res) {
	var got_data = req.body;
	var id = req.params.id;
	
	var sql = "SELECT id, can_id, waste_amount, (SELECT contect_weight FROM Trash_cans WHERE id=log.can_id) as contect_weight FROM Trash_waste_log = log WHERE id="+id;
	
	db.query(sql, function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		//if (result.length > 0) {
			var old_waste_amount = result.contect_weight
			res.json(result);
		//}
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