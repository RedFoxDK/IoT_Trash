var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");
var crypt = require("../functions/crypt");


router.get('/', function(req,res){
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
							db.query("SELECT * FROM Trash_user", function(err, result){
								res.json(result);
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

router.get('/by_type_id/:type_id', function(req,res) {
	var type_id = req.params.type_id;
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
							db.query("SELECT * FROM Trash_user WHERE user_type_id ="+db.escape(type_id), function(err, result){
								res.json(result);
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
	var ids = req.params.id;
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
							db.query("DELETE FROM Trash_user WHERE id = "+db.escape(ids), function(err, result) {
								console.log("User has delete can with ID: "+ids);
								res.json({'Status':"Okay", 'Massage':'user has been deleted'});
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

router.put('/create', function(req, res) {
	var got_data = req.body;
	var secert = crypt.random();
	got_data["sercet_hash"] = crypt.hash(secert);
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	if (!got_data.hasOwnProperty('name') || !got_data.hasOwnProperty('email')) {
		var msg = "The api can't beused with out the values for: name, email and sercert";
		console.log(msg);
		res.json({"Status":"Error", "Message": msg});
	}
		
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query("SELECT * FROM Trash_user WHERE email = "+db.escape(got_data.email), function(err, result) {
								if (result.length < 1) {
									db.query("INSERT INTO Trash_user SET ?", got_data, function(err, result) {
										console.log("Have create a user");
										got_data["secert"] = secert;
										got_data["Status"] = "Okay";
										delete got_data["sercet_hash"];
										res.json(got_data);
									});
								}else{
									var msg = "Error";
									res.json({"Status":"Error", "Message": msg});
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

router.post('/by_id/:id', function(req,res) {
	var id = req.params.id;
	var api_token = req.get('X-API-TOKEN');
	var got_auth = req.body;
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token === undefined) {
		if (!got_auth.hasOwnProperty("auth_email") || !got_auth.hasOwnProperty("auth_sercet")) {
			var msg = "The api auth can't be used with out the values for: auth_email and auth_sercet";
			console.log(msg);
			res.json({"Status":"Error", "Message":msg});
		}else{
			auth_email = got_auth["auth_email"];
			auth_sercet = crypt.hash(got_auth["auth_sercet"]);
			
			db.query("SELECT * FROM Trash_user WHERE email="+db.escape(auth_email)+" AND sercet_hash="+db.escape(auth_sercet), function(err, result) {
				if (err) console.log(err);
				if(result.length > 0) {
					user_id = result[0].id;
					by_id(res, user_id);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								by_id(res, id);					
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
	}
});

function by_id(res, user_id) {
	db.query("SELECT * FROM Trash_user WHERE id ="+db.escape(user_id), function(err, result){
		res.json(result);
	});
}

router.post('/update/:id', function(req, res) {
	var got_data = req.body;
	var id = req.params.id;
	var api_token = req.get('X-API-TOKEN');
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token === undefined) {
		if (!got_data.hasOwnProperty("auth_email") || !got_data.hasOwnProperty("auth_sercet")) {
			var msg = "The api auth can't be used with out the values for: auth_email and auth_sercet";
			console.log(msg);
			res.json({"Status":"Error", "Message":msg});
		}else{
			auth_email = got_data["auth_email"];
			auth_sercet = crypt.hash(got_data["auth_sercet"]);
			delete got_data["auth_email"];
			delete got_data["auth_sercet"];
			
			db.query("SELECT * FROM Trash_user WHERE email="+db.escape(auth_email)+" AND sercet_hash="+db.escape(auth_sercet), function(err, result) {
				if(result.length > 0) {
					user_id = result[0].id;
					update(res, user_id, got_data);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								update(res, id, got_data);				
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
	}
});

function update(res, user_id, got_data) {
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
		if (result.length < 1) {
			db.query("UPDATE Trash_user SET ? WHERE id = "+db.escape(user_id), got_data, function(err, result) {
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
}


router.all('*', function(req, res){
  res.status(404).send("Nope");
});

module.exports = router;