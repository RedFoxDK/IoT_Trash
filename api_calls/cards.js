var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");

var log = require('../functions/log_error');


router.get('/', function(req,res){
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					var sql = "SELECT * FROM Trash_cards";
					if (result[0].is_admin == 1) {
						
					}else{
						sql += " WHERE user_id="+db.escape(user_id);
					}
					db.query(sql, function(err, result){
						res.json(result);
					});
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});

router.post('/deactivate', function(req, res) {
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	var card_user_id;
	var got_data = req.body;
	
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}

	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
					if (result.length > 0) {
						card_user_id = result[0].user_id;
						db.query("SELECT * FROM Trash_user_type WHERE id="+user_type_id, function(err, result){
							if (result[0].is_admin == 1 || user_id == card_user_id) {
								db.query("UPDATE Trash_cards set is_active=0 WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
									res.json({"Status":"Okay", "Message": "The card have been deactivate"});
								});
							}else{
								res.json({"Status":"Error"});
							}
						});
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

router.post('/activate', function(req, res) {
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	var card_user_id;
	var got_data = req.body;
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
					if (result.length > 0) {
						card_user_id = result[0].user_id;
						db.query("SELECT * FROM Trash_user_type WHERE id="+user_type_id, function(err, result){
							if (result[0].is_admin == 1 || user_id == card_user_id) {
								db.query("UPDATE Trash_cards set is_active=1 WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
									res.json({"Status":"Okay", "Message": "The card have been activate"});
								});
							}else{
								res.json({"Status":"Error"});
							}
						});
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

router.delete('/remove/:card_nr', function(req, res) {
	var card_nr = req.params.card_nr;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				if (result.length > 0) {
					db.query("SELECT * FROM Trash_user_type WHERE id="+user_type_id, function(err, result){
						if (result[0].is_admin == 1) {
							db.query("DELETE FROM Trash_cards WHERE card_nr = "+db.escape(card_nr), function(err, result) {
								console.log("User has delete can with ID: "+card_nr);
								res.json({'Status':"Okay", 'Massage':'user has been deleted'});
							});
						}else{
							res.json({"Status":"Error"});
						}
					});
				}else{
					res.json({"Status":"Error"});
				}
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});

router.put('/create', function(req, res) {
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
								if(result.length > 0) {
									var msg = "Card number is already been used";
									res.json({"Status":"Error", "Message": msg});
								}else{
									db.query("INSERT INTO Trash_cards SET ?", got_data, function(err, result) {
										var msg = "The card with the number "+got_data["card_nr"]+" was created";
										console.log(msg);
										res.json({"Status":"Okay", "Message": msg});
									});
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


router.post('/update', function(req, res) {
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty("card_nr")) {
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) {
								if(result.length < 1) {
									var msg = "The card number is no in the database - Please create it before updatering it";
									res.json({"Status":"Error", "Message": msg});
								}else{
									db.query("UPDATE Trash_cards SET ? WHERE card_nr="+db.escape(got_data["card_nr"]), got_data, function(err, result) {
										var msg = "The card with the number "+got_data["card_nr"]+" was updated";
										console.log(msg);
										res.json({"Status":"Okay", "Message": msg});
									});
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
  res.status(401).json({"Status":"Error"});
});

module.exports = router;