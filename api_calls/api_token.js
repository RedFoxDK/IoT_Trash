var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");
var crypt = require("../functions/crypt");

router.get('', function (req, res) {
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
							db.query("SELECT * FROM Trash_api_token", function(err, result) {
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



router.post('/by_user_id/:user_id', function(req, res) {
	var id = req.params.user_id;
	var api_token = req.get('X-API-TOKEN');
	var got_data = req.body;
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
					by_user_id(res, id);
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
								by_user_id(res, id);			
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

function by_user_id(res, user_id) {
	db.query("SELECT * FROM Trash_api_token WHERE user_id="+db.escape(id), function(err, result) {
		res.json(result);
	});
}



router.post('/activate/:token', function(req,res) {
	var api_token = req.params.token;
	var api_token1 = req.get('X-API-TOKEN');
	var got_data = req.body;
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token1 === undefined) {
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
					activate(res, api_token);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token1)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								activate(res, api_token);		
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

function activate(res, api_token) {
	db.query("SELECT * FROM Trash_api_token WHERE api_token ="+db.escape(api_token), function(err, result) {
		if (result.length > 0) {
			var sql = "UPDATE Trash_api_token SET is_activate=1 WHERE api_token="+db.escape(api_token);
			db.query(sql, function(err, result) {
				res.json({"Status":"Okay", "Message":"token update"});
			});
		}else{
			res.json({"Status":"Error", "Message":"Error"});
		}
	});
}



router.post('/deactivate/:token', function(req,res) {
	var api_token = req.params.token;
	var api_token1 = req.get('X-API-TOKEN');
	var got_data = req.body;
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token1 === undefined) {
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
					deactivate(res, api_token);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token1)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								deactivate(res, api_token);		
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

function deactivate(res, api_token) {
	db.query("SELECT * FROM Trash_api_token WHERE api_token ="+db.escape(api_token), function(err, result) {
		if (result.length > 0) {
			var sql = "UPDATE Trash_api_token SET is_activate=0 WHERE api_token="+db.escape(api_token);
			db.query(sql, function(err, result) {
				res.json({"Status":"Okay", "Message":"token update"});
			});
		}else{
			res.json({"Status":"Error", "Message":"Error"});
		}
	});
}



router.delete('/remove/:token', function(req,res) {
	var api_token = req.params.token;
	var api_token1 = req.get('X-API-TOKEN');
	var got_data = req.body;
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token1 === undefined) {
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
					remove(res, api_token);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token1)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								remove(res, api_token);		
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

function remove(res, api_token) {
	db.query("SELECT * FROM Trash_api_token WHERE api_token ="+db.escape(api_token), function(err, result) {
		if (result.length > 0) {
			var sql = "DELETE FROM Trash_api_token WHERE api_token="+db.escape(api_token);
			db.query(sql, function(err, result) {
				res.json({"Status":"Okay", "Message":"token remove"});
			});
		}else{
			res.json({"Status":"Error", "Message":"Error"});
		}
	});	
}



router.post('/update/:token', function(req,res) {
	var api_token = req.params.token;
	var got_data = req.body;
	var api_token1 = req.get('X-API-TOKEN');
	var got_data = req.body;
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token1 === undefined) {
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
					update(res, api_token, got_data);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token1)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								update(res, api_token, got_data);	
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


function update(res, api_token, got_data) {
	if (got_data.hasOwnProperty("id")) {
		delete got_data["id"];
	}
	if (got_data.hasOwnProperty("api_token")) {
		delete got_data["api_token"];
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE api_token ="+db.escape(api_token), function(err, result) {
		if (result.length > 0) {
			var sql = "UPDATE Trash_api_token SET ? WHERE api_token="+db.escape(api_token);
			db.query(sql, got_data, function(err, result) {
				res.json({"Status":"Okay", "Message":"token has been update"});
			});
		}else{
			res.json({"Status":"Error", "Message":"Error"});
		}
	});	
}



router.put('/create', function(req,res) {
	var got_data = req.body;
	var api_token1 = req.get('X-API-TOKEN');
	var got_data = req.body;
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token1 === undefined) {
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
					got_data["user_id"] = user_id;
					create(res, got_data);
				}else{
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token1)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {							
								create(res, got_data);	
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

function create(res, got_data) {
	if (got_data.hasOwnProperty("id")) {
		delete got_data["id"];
	}
	
	if (!got_data.hasOwnProperty("user_id")) {
		var msg = "The api can't beused with out the values for: user_id";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}else{
		db.query("SELECT * FROM Trash_user WHERE id="+db.escape(got_data["user_id"]), function(err, result) {
			if(result.length > 0) {
				 got_data["api_token"] = crypt.api_random();
				 db.query("SELECT * FROM Trash_api_token WHERE api_token="+db.escape(got_data["api_token"]), function(err, result) {
					if (result.length < 1) {
						db.query("INSERT INTO Trash_api_token SET ?", got_data, function(err, result) {
							var obj = {"Status":"okay", "api_token":got_data["api_token"]};
							res.json(obj);
						});
					}else{
						var msg = "The token: "+ got_data["api_token"] + " is already in the database";
						console.log(msg);
						res.json({"Status":"Error", "Message":"Error - Try again"});
					}
				 });
			}else{
				var msg = "User is not in the db";
				console.log(msg);
				res.json({"Status":"Error", "Message":"User is not in the db"});
			}
		});
	}
}


router.all('*', function(req, res){
  res.status(404).send("Nope");
});

module.exports = router;