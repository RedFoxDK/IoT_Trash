var express = require("express"); //Module for route the http path 
var bodyParser = require("body-parser"); //For getting the body of the request 
var db = require("../functions/db"); //The database conncontion
var router = express.Router(); //create the variable for routing the http  


//Get a list over all user types
router.get('/', function(req,res) { //Path: /api/user_type/
	db.query("SELECT * FROM Trash_user_type", function(err, result){ //Make a SQL call and return the result to client
		res.json(result);
	});
});

//Get a user type by it is ID
router.get('/by_id/:id', function(req,res) { //Path: /api/user_type/by_id/(user_type_id)
	var id = req.params.id; //Get the giving id
	db.query("SELECT * FROM Trash_user_type WHERE id ="+db.escape(id), function(err, result){ //Make the SQL call and return the result
		res.json(result);
	});
});

//Create a new user type
//Only admins token can do this
//Need: name:String
router.put('/create', function(req,res) { //Path: /api/user_type/create
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty('name')) { //Check if all is there that is need or else create a error and log it
		var msg = "The api can't beused with out the values for: name";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	if (got_data.hasOwnProperty('is_company') || got_data.hasOwnProperty('is_state') || got_data.hasOwnProperty('is_dev')) { //check if any of those is there or else will the type just become a private user type
		got_data["is_private"] = 0;
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("INSERT INTO Trash_user_type SET ?", got_data, function(err, result) { //Insert the new user type into the database					
							console.log("A user type has been created");
							res.json({"Status":"Okay", "Message":"User Type has created"});
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
	
});

//Update a user type by the giving id
//Only for admins tokens
//Need: atlease one of the is_XXX has to be 1
router.post('/update/:id', function(req,res) { //Path: /api/user_type/update/(user_type_id)
	var ids = req.params.id; //Get the giving user_type_id
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	if (!got_data.hasOwnProperty('is_private')) { //check if the key is in the json array or else setto 0
		got_data["is_private"] = 0;
	}
	if (!got_data.hasOwnProperty('is_company')) { //check if the key is in the json array or else setto 0
		got_data["is_company"] = 0;
	}
	if (!got_data.hasOwnProperty('is_state')) { //check if the key is in the json array or else setto 0
		got_data["is_state"] = 0;
	}
	if (!got_data.hasOwnProperty('is_dev')) { //check if the key is in the json array or else setto 0
		got_data["is_dev"] = 0;
	}
	if (!got_data.hasOwnProperty('is_admin')) { //check if the key is in the json array or else setto 0
		got_data["is_admin"] = 0;
	}
	
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_user_type WHERE id = "+db.escape(ids), function(err, result) { //Check if the user_type is in the db
							if (result.length > 0) { //if it is then update it and tell client
								db.query("UPDATE Trash_user_type SET ? WHERE id = "+db.escape(ids), got_data, function(err, result) {
									console.log("Have update a user type");
									res.json({"Status":"Okay", "Message":"User type has been opdate"});
								});
							}else{ // tell client if the user type is not in the db
								res.json({"Status":"Error", "Message":"No user type with that id"});
							}
						});
					}else{
						res.json({"Status":"Not allow"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Delete a user type and set all user with that type id to 0
//Only for admins tokens
router.delete('/remove/:id', function(req, res) { //Path: /api/user_type/remove/(user_type_id)
	var id = req.params.id; //Get the giving user_type_id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_user_type WHERE id = "+db.escape(id), function(err, result) { //Check if the user_type is in the db
							if(result.length > 0) { //if the user type is there then change the affected users id and then delete the user type 
								db.query("UPDATE Trash_user SET user_type_id=0 WHERE user_type_id="+db.escape(id), function(err, result) { //change all users with the giving user type to 0
										db.query("DELETE FROM Trash_user_type WHERE id = "+db.escape(id), function(err, result) { //Delete the user type and tell client
												res.json({"Status":"Okay", "Message":"User type has been delete"});
										});
								});
							}else{ // tell client if the user type is not in the db
								res.json({"Status":"Error", "Message":"No user type with that id"});
							}
						});
					}else{
						res.json({"Status":"Not allow"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});


//if the client try to acces a path there is not here
router.all('*', function(req, res){
  res.status(404).send("Nope"); //return a error 404 and log it
});

module.exports = router; //returne the routes for use in the app file