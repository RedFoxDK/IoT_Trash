var express = require("express"); //Module for route the http path 
var bodyParser = require("body-parser"); //For getting the body of the request 
var db = require("../functions/db"); //The database conncontion
var crypt = require("../functions/crypt"); //own build module that can hash strings and generate a random string
var router = express.Router(); //create the variable for routing the http  


// Get a list over all the users
//Can only be use by the admins
router.get('/', function(req,res){ //Path: /api/user/
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_user", function(err, result){ //Get all the users and send it to the client
							res.json(result);
						});
					}else{ //if the token owner is not a admin
						res.json({"Status":"Error"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Get all user by a user type
//Can only be use by the admins
router.get('/by_type_id/:type_id', function(req,res) { //Path: /api/user/by_type_id/(user_type_id)
	var type_id = req.params.type_id; //Get the giving user type id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_user WHERE user_type_id ="+db.escape(type_id), function(err, result){ //Get all the users from the wished user type
							res.json(result);
						});
					}else{ //if the token owner is not a admin
						res.json({"Status":"Error"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Delete a user by a giving id
//Can only be use by the admins
router.delete('/remove/:id', function(req, res) { //Path: /api/user/remove/(user_id)
	var ids = req.params.id; //Get the giving user id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("DELETE FROM Trash_user WHERE id = "+db.escape(ids), function(err, result) { //Delete the user in the database
							console.log("User has delete can with ID: "+ids);
							res.json({'Status':"Okay", 'Massage':'user has been deleted'});
						});
					}else{ //if the token owner is not a admin
						res.json({"Status":"Error"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Create a new user 
//Only for admins
//Needs: name:String and email:String
router.put('/create', function(req, res) { //Path: /api/user/create
	var got_data = req.body; //Get request body
	var secert = crypt.random(); //Gerenete a random 64 lenght string for used as a secert
	got_data["sercet_hash"] = crypt.hash(secert); //hash the random string
	var api_token = req.get('X-API-TOKEN');  //Get the token i the HTTP header
	var user_id, user_type_id;
	
	if (!got_data.hasOwnProperty('name') || !got_data.hasOwnProperty('email')) { //Check if it have all it needs or else tell the client it 
		var msg = "The api can't beused with out the values for: name and email";
		console.log(msg);
		res.json({"Status":"Error", "Message": msg});
	}
		
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_user WHERE email = "+db.escape(got_data.email), function(err, result) { //Check if the giving email is already been used
							if (result.length < 1) { //if it has not been used - create the user and return the secert
								db.query("INSERT INTO Trash_user SET ?", got_data, function(err, result) {
									console.log("Have create a user");
									got_data["secert"] = secert;
									got_data["Status"] = "Okay";
									delete got_data["sercet_hash"];
									res.json(got_data);
								});
							}else{ //If the email have is been used then return a erorr
								var msg = "Error";
								res.json({"Status":"Error", "Message": msg});
							}
						});
					}else{ //if the token owner is not a admin
						res.json({"Status":"Error"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Get a user from the giving user id
// Admins can get other users but others can only get them self
// Needs for other user then admins: auth_email:String and auth_sercet:String (the unhash sercet for the user)
router.post('/by_id/:id', function(req,res) {  //Path: /api/user/by_id/(user_id)
	var id = req.params.id; //Get the giving user_id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var got_auth = req.body; //Get request body
	var auth_email, auth_sercet;
	var user_id, user_type_id;

	if (api_token === undefined) { //Check if the client will use token or not
		if (!got_auth.hasOwnProperty("auth_email") || !got_auth.hasOwnProperty("auth_sercet")) { //check if the auth needs is there or else error 
			var msg = "The api auth can't be used with out the values for: auth_email and auth_sercet";
			console.log(msg);
			res.json({"Status":"Error", "Message":msg});
		}else{
			auth_email = got_auth["auth_email"]; 
			auth_sercet = crypt.hash(got_auth["auth_sercet"]); //hash the giving unhash secert 
			
			db.query("SELECT * FROM Trash_user WHERE email="+db.escape(auth_email)+" AND sercet_hash="+db.escape(auth_sercet), function(err, result) { //check if a user has that email with that hash
				if(result.length > 0) { //If the user is there
					user_id = result[0].id; //take the users id
					by_id(res, user_id); //use the "get user by id" function
				}else{ // if the users is not here then send a error
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{ // if the user choose to use token
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
			if (result.length > 0) { // if the token is in the db and is activate
				user_id = result[0].user_id; //get user_id for token
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
					user_type_id = result[0].user_type_id; //get user type
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
						if (result[0].is_admin == 1) { //check if tokens owner is a admin						
							by_id(res, id); //use the "get user by id" function	
						}else{ //if the token owner is not a admin
							res.json({"Status":"Error"});
						}
					});
				});
			}else{ //if the token is either the token is not in the db or if it's not active
				res.json({"Status":"Not allow"}); //return that the client is not allow
			}
		});
	}
});

//Get all about a user with the giving user_id
//used for the path: /api/user/by_id/(user_id)
function by_id(res, user_id) {
	db.query("SELECT * FROM Trash_user WHERE id ="+db.escape(user_id), function(err, result){
		res.json(result);
	});
}

// Update a user from the giving user id
// Admins can update other users but others can only update them self
// Needs for other user then admins: auth_email:String and auth_sercet:String (the unhash sercet for the user)
router.post('/update/:id', function(req, res) { //Path: /api/user/update/(user_id)
	var got_data = req.body; //Get request body
	var id = req.params.id; //Get the giving user_id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var auth_email, auth_sercet;
	var user_id, user_type_id;
	
	if (api_token === undefined) { //Check if the client will use token or not
		if (!got_auth.hasOwnProperty("auth_email") || !got_auth.hasOwnProperty("auth_sercet")) { //check if the auth needs is there or else error 
			var msg = "The api auth can't be used with out the values for: auth_email and auth_sercet";
			console.log(msg);
			res.json({"Status":"Error", "Message":msg});
		}else{
			auth_email = got_auth["auth_email"]; 
			auth_sercet = crypt.hash(got_auth["auth_sercet"]); //hash the giving unhash secert
			delete got_data["auth_email"]; //remove the auth email from the update query
			delete got_data["auth_sercet"];	 //remove the auth sercet from the update query		
			
			db.query("SELECT * FROM Trash_user WHERE email="+db.escape(auth_email)+" AND sercet_hash="+db.escape(auth_sercet), function(err, result) { //check if a user has that email with that hash
				if(result.length > 0) { //If the user is there
					user_id = result[0].id; //take the users id
					update(res, user_id, got_data); //Used the function to update a user 
				}else{  // if the users is not here then send a error
					var msg = "The api auth can't find you";
					console.log(msg);
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}else{ // if the user choose to use token
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
			if (result.length > 0) { // if the token is in the db and is activate
				user_id = result[0].user_id; //get user_id for token
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
					user_type_id = result[0].user_type_id; //get user type
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner
						if (result[0].is_admin == 1) { //check if tokens owner is a admin							
							update(res, id, got_data); //Used the function to update a user 		
						}else{ //if the token owner is not a admin
							res.json({"Status":"Error"});
						}
					});
				});
			}else{ //if the token is either the token is not in the db or if it's not active
				res.json({"Status":"Not allow"}); //return that the client is not allow
			}
		});
	}
});

//Update a user by the giving user id
//used for the path: /api/user/update/(user_id)
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


//if the client try to acces a path there is not here
router.all('*', function(req, res){
  res.status(404).send("Nope"); //return a error 404 and log it
});

module.exports = router; //returne the routes for use in the app file