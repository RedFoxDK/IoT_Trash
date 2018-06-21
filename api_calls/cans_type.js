var express = require("express"); //Module for route the http path 
var bodyParser = require("body-parser"); //For getting the body of the request 
var db = require("../functions/db"); //The database conncontion
var router = express.Router(); //create the variable for routing the http  

//Get all cans_types in the database
router.get('/', function(req,res) {  //Path: /api/cans_type/
	db.query("SELECT * FROM Trash_cans_type", function(err, result){ //Get all can types and return result
		res.json(result);
	});
});

//Get a cans_type by a giving id for the cans_type 
router.get('/by_id/:id', function(req,res) { //Path: /api/cans_type/by_id/(cans_type_id)
	var id = req.params.id;
	db.query("SELECT * FROM Trash_cans_type WHERE id ="+db.escape(id), function(err, result){ //Get the cans types and return result
		res.json(result);
	});
});

//Create a new cans_type in the datebase
//Can only be used by admins
//Needs: name:String
router.put('/create', function(req,res) { //Path: /api/cans_type/create
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	if (!got_data.hasOwnProperty('name')) { //check if it has all that is need or else send a error to user
		var msg = "The api can't beused with out the values for: name";
		console.log(msg);
	}

	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("INSERT INTO Trash_cans_type SET ?", got_data, function(err, result) { //Create the cans type in the db and return
							console.log("A can type has been created");
							res.json({"Status":"Okay", "Message":"Can Type has created"});
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

//Update a cans_type by a giving id
//Can only been use by a admins tokens
//Needs: name:String
router.post('/update/:id', function(req,res) {
	var ids = req.params.id; //Get the cans_type_id
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty('name')) { //check if it has all that is need or else send a error to user
		var msg = "The api can't beused with out the values for: name";
		console.log(msg);
		exit();
	}
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_cans_type WHERE id = "+db.escape(ids), function(err, result) { //Get the cans_type
							if (result.length > 0) { //check if the type is in the datebase
								db.query("UPDATE Trash_cans_type SET ? WHERE id = "+db.escape(ids), got_data, function(err, result) { //Update the cans_type
									console.log("Have update a can type");
									res.json({"Status":"Okay", "Message":"Can type has been opdate"});
								});
							}else{ //if not then return with a error
								res.json({"Status":"Error", "Message":"No can type with that id"});
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


//Delete a cans_type and set all the affected cans 
//Only admins can use the api called
router.delete('/remove/:id', function(req, res) {
	var id = req.params.id; //Get the giving cans_type_id
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query('SELECT * FROM Trash_cans_type WHERE id = '+db.escape(id), function(err, result) { //Get information about the cans_type
							if(result.length > 0) { //check if the type findes
								db.query("UPDATE Trash_cans SET cans_type_id=0 WHERE cans_type_id="+db.escape(id), function(err, result) { //update all the affected cans to cans_type to 0
									db.query("DELETE FROM Trash_cans_type WHERE id = "+db.escape(id), function(err, result) { //Delete the can_type
										res.json({"Status":"Okay", "Message":"Can type has been delete"});
									});
								});
							}else{ //if the can_type is not in the db
								res.json({"Status":"Error", "Message":"No can type with that id"});
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


//if the client try to acces a path there is not here
router.all('*', function(req, res){
  res.status(404).send("Nope"); //return a error 404 and log it
});

module.exports = router; //returne the routes for use in the app file