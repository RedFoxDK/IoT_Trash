var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");
var crypt = require("../functions/crypt");

router.get('/', function(req,res){
	db.query("SELECT * FROM Trash_user", function(err, result){
		res.json(result);
	});
});

router.get('/by_id/:id', function(req,res) {
	var id = req.params.id;
	db.query("SELECT * FROM Trash_user WHERE id ="+db.escape(id), function(err, result){
		res.json(result);
	});
});

router.get('/by_email/:email', function(req,res) {
	var email = req.params.email;
	db.query("SELECT * FROM Trash_user WHERE email ="+db.escape(email), function(err, result){
		res.json(result);
	});
});

router.get('/by_type_id/:type_id', function(req,res) {
	var type_id = req.params.type_id;
	db.query("SELECT * FROM Trash_user WHERE user_type_id ="+db.escape(type_id), function(err, result){
		res.json(result);
	});
});

router.put('/create', function(req, res) {
	var got_data = req.body;
	if (!got_data.hasOwnProperty('name') || !got_data.hasOwnProperty('email')) {
		var msg = "The api can't beused with out the values for: name, email and sercert";
		console.log(msg);
		exit();
	}
	var secert = crypt.random();
	got_data["sercet_hash"] = crypt.hash(secert);
	
	db.query("SELECT * FROM Trash_user WHERE email = "+db.escape(got_data.email), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
		}
		
		if (result.length < 1) {
			db.query("INSERT INTO Trash_user SET ?", got_data, function(err, result) {
				if (err){
					var d_msg = "Database error handle: "+err;
					console.error(d_msg);
					var msg = "Database error - Try again or contact IT-administrator";
					console.error(msg);
				}
				console.log("Have create a user");
				got_data["secert"] = secert;
				got_data["Status"] = "Okay";
				delete got_data["sercet_hash"];
				res.json(got_data);
			});
		}
	});
});


router.post('/update/:id', function(req, res) {
	var got_data = req.body;
	var ids = req.params.id;
	var secert = "";
	if (got_data.hasOwnProperty("id") || got_data.hasOwnProperty("sercet_hash")) {
		delete got_data["id"], got_data["sercet_hash"];
	}
	if(got_data.hasOwnProperty("secert")) {
		secert = got_data["secert"];
		delete got_data["secert"];
		got_data["sercet_hash"] = crypt.hash(secert);
	}
	db.query("SELECT * FROM Trash_user WHERE email = "+db.escape(got_data.email), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
		}	
		if (result.length < 1) {
			db.query("UPDATE Trash_user SET ? WHERE id = "+db.escape(ids), got_data, function(err, result) {
				if (err){
					var d_msg = "Database error handle: "+err;
					console.error(d_msg);
					var msg = "Database error - Try again or contact IT-administrator";
					console.error(msg);
				}
				console.log("Have update a user");
				if (secert != "") {
					got_data["secert"] = secert;
					delete got_data["sercet_hash"];
				}
				got_data["Status"] = "Okay";
				res.json(got_data);
			});
		}else{
			res.json({"Status":"Error", "Message":"Email is either been already use by another user or by this user"});
		}
	});
});

router.delete('/remove/:id', function(req, res) {
	var ids = req.params.id;
	db.query("DELETE FROM Trash_user WHERE id = "+db.escape(ids), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			var msg = "Database error - Try again or contact IT-administrator";
			error_msg(res,msg, d_msg);
		}
		console.log("User has delete can with ID: "+ids);
		res.json({'Status':"Okay", 'Massage':'user has been deleted'});
	});
});

router.all('*', function(req, res){
  res.status(404).send("Nope");
});

module.exports = router;