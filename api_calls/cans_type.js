var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");


router.get('/', function(req,res) {
	db.query("SELECT * FROM Trash_cans_type", function(err, result){
		res.json(result);
	});
});

router.get('/by_id/:id', function(req,res) {
	var id = req.params.id;
	db.query("SELECT * FROM Trash_cans_type WHERE id ="+db.escape(id), function(err, result){
		res.json(result);
	});
});

router.put('/create', function(req,res) {
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	if (!got_data.hasOwnProperty('name')) {
		var msg = "The api can't beused with out the values for: name";
		console.log(msg);
	}

	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query("INSERT INTO Trash_cans_type SET ?", got_data, function(err, result) {
								console.log("A can type has been created");
								res.json({"Status":"Okay", "Message":"Can Type has created"});
							});
						}else{
							res.json({"Status":"Error"});
						}
					}else{
						res.json({"Status":"Error"});
					}
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
	
});

router.post('/update/:id', function(req,res) {
	var ids = req.params.id;
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty('name')) {
		var msg = "The api can't beused with out the values for: name";
		console.log(msg);
		exit();
	}
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query("SELECT * FROM Trash_cans_type WHERE id = "+db.escape(ids), function(err, result) {
								if (result.length > 0) {
									db.query("UPDATE Trash_cans_type SET ? WHERE id = "+db.escape(ids), got_data, function(err, result) {
										console.log("Have update a can type");
										res.json({"Status":"Okay", "Message":"Can type has been opdate"});
									});
								}else{
									res.json({"Status":"Error", "Message":"No can type with that id"});
								}
							});
						}else{
							res.json({"Status":"Error"});
						}
					}else{
						res.json({"Status":"Error"});
					}
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});

router.delete('/remove/:id', function(req, res) {
	var id = req.params.id;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query('SELECT * FROM Trash_cans_type WHERE id = '+db.escape(id), function(err, result) {
								if(result.length > 0) {
									db.query("UPDATE Trash_cans SET cans_type_id=0 WHERE cans_type_id="+db.escape(id), function(err, result) {
										db.query("DELETE FROM Trash_cans_type WHERE id = "+db.escape(id), function(err, result) {
											if (err) {
												var d_msg = "Database error handle: "+err;
												console.error(d_msg);
												var msg = "Database error - Try again or contact IT-administrator";
												console.error(msg);
												res.json({"Status":"Error", "Message":msg});
											}else{
												res.json({"Status":"Okay", "Message":"Can type has been delete"});
											}
										});
									});
								}else{
									res.json({"Status":"Error", "Message":"No can type with that id"});
								}
							});
						}else{
							res.json({"Status":"Error"});
						}
					}else{
						res.json({"Status":"Error"});
					}
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});


router.all('*', function(req, res){
  res.status(404).send("Nope");
});

module.exports = router;