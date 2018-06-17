var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");


router.get('/', function(req,res){
	db.query("SELECT * FROM Trash_cards", function(err, result){
		res.json(result);
	});
});

router.post('/deactivate', function(req, res) {
	var got_data = req.body;
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
		exit();
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
		exit();
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
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		console.log("User has delete can with ID: "+card_nr);
		res.json({'Status':"Okay", 'Massage':'user has been deleted'});
	});
});

router.put('/create', function(req, res) {
	var got_data = req.body;
	
	//db.query("SELECT * FROM Trash_card WHERE card_nr=");
});

router.all('*', function(req, res){
  res.status(404).send("Nope");
});

module.exports = router;