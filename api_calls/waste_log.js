var express = require("express"); //Module for route the http path 
var bodyParser = require("body-parser"); //For getting the body of the request 
var db = require("../functions/db"); //The database conncontion
var datetime = require('node-datetime'); //Module for converting datetime into timestamp
var router = express.Router(); //create the variable for routing the http  


//Give a list over all logs, in the wastelog, for the user
//if token is a admin, it will return all logs no matter user
router.get('', function(req,res){ //Path: /api/waste_log/
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					var sql = "SELECT * FROM Trash_waste_log"; //begin on the SQL call
					if (result[0].is_admin != 1) { //check if token owner is not a admin
						sql += " WHERE user_id="+user_id; //make the SQL call is it only get logs form the user
					}
					db.query(sql,function(err, result){ //Query the SQL call
						res.json(result); //return the result and log it
					});
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Give a list over all logs, in the wastelog, for a user
//Only admins can get it from other users else will it return the users logs
router.get('/by_user/:id', function(req,res){ //Path: /api/waste_log/by_user/(user_id)
	var id = req.params.id; //Get the giving user_id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					var sql = "SELECT * FROM Trash_waste_log"; //begin on the SQL call
					if (result[0].is_admin != 1 || user_id == id) { //check if token owner is not a admin or user_id is the same user_id for tokens owner
						sql += " WHERE user_id="+user_id;
					}else{ //else use the tokens owner id
						sql += " WHERE user_id="+id;
					}
					db.query(sql,function(err, result){ //Query the SQL call
						res.json(result); //return the result and log it
					});
				});
			});
		}else{//if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Give a list over all logs, in the wastelog, for can
//Only admins can use this call
router.get('/by_can/:id', function(req,res) { //Path: /api/waste_log/by_can/(canid)
	var id = req.params.id; //Get the giving can_id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_waste_log WHERE can_id ="+db.escape(id)+"", function(err, result){ //get all logs from the can
							res.json(result);
						});
					}else{ //if the token owner is not a admin
						res.json({"Status":"Not allow"});
					}	
				});
			});
		}else{//if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Create a new waste log
//Only admins tokens can this
//Need: User_id:INT, can_id:INT and waste_amount:INT
router.put('/create', function(req,res) { //Path: /api/waste_log/create
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	if (!got_data.hasOwnProperty('user_id') || !got_data.hasOwnProperty("can_id") || !got_data.hasOwnProperty('waste_amount')) { // check if all is there that is need or else error
		var msg = "The api can't beused with out the values for: user_id, can_id and waste_amount";
		res.json({"Stauts": msg});
	}else{ //if all that is need is in the body
		if (!got_data.hasOwnProperty('time')) { //check if there is a time or else take the time right now and save it as timestamp format
			got_data["time"] = datetime.create().getTime();
		}else{
			got_data["time"] = datetime.create(got_data["time"]).getTime();
		}
		
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
							db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) { //inserte into the database and return message to user
								console.log("Have create a log in the waste log");
								res.json({"Status":"Okay", "Message":"The log has been created"});
							});
						}else{ //if the token owner is not a admin
							res.json({"Status":"Not allow"});
						}	
					});
				});
			}else{ //if the token is either the token is not in the db or if it's not active
				res.json({"Status":"Not allow"}); //return that the client is not allow
			}
		});
	}
});

//if the client try to acces a path there is not here
router.all('*', function(req, res){
  res.status(404).send("Nope"); //return a error 404 and log it
});


module.exports = router; //returne the routes for use in the app file