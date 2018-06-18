var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");


router.get('/', function(req,res) {
	db.query("SELECT * FROM Trash_user_type", function(err, result){
		res.json(result);
	});
});

router.get('/by_id/:id', function(req,res) {
	var id = req.params.id;
	db.query("SELECT * FROM Trash_user_type WHERE id ="+db.escape(id), function(err, result){
		res.json(result);
	});
});

router.put('/create', function(req,res) {
	var got_data = req.body;
	if (!got_data.hasOwnProperty('name')) {
		var msg = "The api can't beused with out the values for: name";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	if (got_data.hasOwnProperty('is_company') || got_data.hasOwnProperty('is_state') || got_data.hasOwnProperty('is_dev')) {
		got_data["is_private"] = 0;
	}
	
	db.query("INSERT INTO Trash_user_type SET ?", got_data, function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
		}
		
		console.log("A user type has been created");
		res.json({"Status":"Okay", "Message":"User Type has created"});
	});
	
});

router.post('/update/:id', function(req,res) {
	var ids = req.params.id;
	var got_data = req.body;
	if (!got_data.hasOwnProperty('is_private')) {
		got_data["is_private"] = 0;
	}
	if (!got_data.hasOwnProperty('is_company')) {
		got_data["is_company"] = 0;
	}
	if (!got_data.hasOwnProperty('is_state')) {
		got_data["is_state"] = 0;
	}
	if (!got_data.hasOwnProperty('is_dev')) {
		got_data["is_dev"] = 0;
	}
	if (!got_data.hasOwnProperty('is_admin')) {
		got_data["is_admin"] = 0;
	}
	
	db.query("SELECT * FROM Trash_user_type WHERE id = "+db.escape(ids), function(err, result) {
		if (err){
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message":msg});
		}
		
		if (result.length > 0) {
			db.query("UPDATE Trash_user_type SET ? WHERE id = "+db.escape(ids), got_data, function(err, result) {
				if (err) {
					var d_msg = "Database error handle: "+err;
					console.error(d_msg);
					var msg = "Database error - Try again or contact IT-administrator";
					console.error(msg);
					res.json({"Status":"Error", "Message":msg});
				}else{
					console.log("Have update a user type");
					res.json({"Status":"Okay", "Message":"User type has been opdate"});
				}
			});
		}else{
			res.json({"Status":"Error", "Message":"No user type with that id"});
		}
	});
});

router.delete('/remove/:id', function(req, res) {
	var id = req.params.id;
	
	db.query('SELECT * FROM Trash_user_type WHERE id = '+db.escape(id), function(err, result) {
		if (err) {
			var d_msg = "Database error handle: "+err;
			console.error(d_msg);
			var msg = "Database error - Try again or contact IT-administrator";
			console.error(msg);
			res.json({"Status":"Error", "Message":msg});
		}
		
		if(result.length > 0) {
			db.query("UPDATE Trash_user SET user_type_id=0 WHERE user_type_id="+db.escape(id), function(err, result) {
				if (err) {
					var d_msg = "Database error handle: "+err;
					console.error(d_msg);
					var msg = "Database error - Try again or contact IT-administrator";
					console.error(msg);
					res.json({"Status":"Error", "Message":msg});
				}else{
					db.query("DELETE FROM Trash_user_type WHERE id = "+db.escape(id), function(err, result) {
						if (err) {
							var d_msg = "Database error handle: "+err;
							console.error(d_msg);
							var msg = "Database error - Try again or contact IT-administrator";
							console.error(msg);
							res.json({"Status":"Error", "Message":msg});
						}else{
							res.json({"Status":"Okay", "Message":"User type has been delete"});
						}
					});
				}
			});
		}else{
			res.json({"Status":"Error", "Message":"No user type with that id"});
		}
	});
});


router.all('*', function(req, res){
  res.status(404).send("Nope");
});

module.exports = router;