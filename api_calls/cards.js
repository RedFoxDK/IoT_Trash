var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");

var log = require('../functions/log_error');



router.get('/', function(req,res){
	log.error_msg(req, res, 1, "Test", "Hemlig test");
	db.query("SELECT * FROM Trash_cards", function(err, result){
		//res.json(result);
	});
	
});

router.post('/deactivate', function(req, res) {
	var got_data = req.body;
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("UPDATE Trash_cards set is_active=0 WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}
		
		res.json({"Status":"Okay", "Message": "The card have been deactivate"});
	});
});

router.post('/activate', function(req, res) {
	var got_data = req.body;
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("UPDATE Trash_cards set is_active=1 WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}
		
		res.json({"Status":"Okay", "Message": "The card have been activate"});
	});
});

router.delete('/remove/:card_nr', function(req, res) {
	var card_nr = req.params.card_nr;
	db.query("DELETE FROM Trash_cards WHERE card_nr = "+db.escape(card_nr), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}
		console.log("User has delete can with ID: "+card_nr);
		res.json({'Status':"Okay", 'Massage':'user has been deleted'});
	});
});

router.put('/create', function(req, res) {
	var got_data = req.body;
	
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}
		
		if(result.length > 0) {
			var msg = "Card number is already been used";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}else{
			db.query("INSERT INTO Trash_cards SET ?", got_data, function(err, result) {
				if (err){
					var d_msg = "Database error handle: "+err;
					console.error(d_msg);
					var msg = "Database error - Try again or contact IT-administrator";
					console.error(msg);
					res.json({"Status":"Error", "Message": msg});
				}
				var msg = "The card with the number "+got_data["card_nr"]+" was created";
				console.log(msg);
				res.json({"Status":"Okay", "Message": msg});
			});
		}
	});
});


router.post('/update', function(req, res) {
	var got_data = req.body;
	
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}
		if(result.length < 1) {
			var msg = "The card number is no in the database - Please create it before updatering it";
			console.error(msg);
			res.json({"Status":"Error", "Message": msg});
		}else{
			db.query("UPDATE Trash_cards SET ? WHERE card_nr="+db.escape(got_data["card_nr"]), got_data, function(err, result) {
				if (err){
					var d_msg = "Database error handle: "+err;
					console.error(d_msg);
					var msg = "Database error - Try again or contact IT-administrator";
					console.error(msg);
					res.json({"Status":"Error", "Message": msg});
				}
				var msg = "The card with the number "+got_data["card_nr"]+" was updated";
				console.log(msg);
				res.json({"Status":"Okay", "Message": msg});
			});
		}
	});
});

router.all('*', function(req, res){
  res.status(401).json({"Status":"Error"});
});

module.exports = router;