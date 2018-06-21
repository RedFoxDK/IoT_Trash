var express = require("express"); //Module for route the http path 
var bodyParser = require("body-parser"); //For getting the body of the request 
var db = require("../functions/db"); //The database conncontion
var router = express.Router(); //create the variable for routing the http  


var log = require('../functions/log_error');

//Get all cards in the database
//Admins will get all the cards while others will only get the cards with their user_id on
router.get('/', function(req,res){ //Path: /api/cards/
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					var sql = "SELECT * FROM Trash_cards"; //being on the SQL call
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						
					}else{ //or if it a normal users
						sql += " WHERE user_id="+db.escape(user_id); //add os it only sercah for cards that is used by the user it self
					}
					db.query(sql, function(err, result){ //Do the SQL call and return it
						res.json(result);
					});
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Deactivate a giving card
//Admins can deactive other users card while others only can deactivate their own cards
//Needs: card_nr:Int
router.post('/deactivate', function(req, res) { //Path: /api/cards/deactivate
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	var card_user_id;
	var got_data = req.body; //Get request body
	
	if (!got_data.hasOwnProperty("card_nr")) { //check if it has all that is need or else send a error to user
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}

	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) { //Get the card information
					if (result.length > 0) { //check if the card is in the DB
						card_user_id = result[0].user_id; //hold the card owner id
						db.query("SELECT * FROM Trash_user_type WHERE id="+user_type_id, function(err, result){  //Get the user type for the token's owner 
							if (result[0].is_admin == 1 || user_id == card_user_id) { //check if the user are a admin or the cards owner is the same as the token owner
								db.query("UPDATE Trash_cards set is_active=0 WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) { //update the db and return
									res.json({"Status":"Okay", "Message": "The card have been deactivate"});
								});
							}else{ //if the token owner is not a admin and card owner is not the same a token owner
								res.json({"Status":"Error"});
							}
						});
					}else{ // if the card is not in the database - return error
						res.json({"Status":"Error"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Activate a giving card
//Admins can deactive other users card while others only can activate their own cards
//Needs: card_nr:Int
router.post('/activate', function(req, res) { //Path: /api/cards/activate
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	var card_user_id;
	var got_data = req.body; //Get request body
	if (!got_data.hasOwnProperty("card_nr")) { //check if it has all that is need or else send a error to user
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) { //Get the card information
					if (result.length > 0) { //check if the card is in the DB
						card_user_id = result[0].user_id; //hold the card owner id
						db.query("SELECT * FROM Trash_user_type WHERE id="+user_type_id, function(err, result){  //Get the user type for the token's owner 
							if (result[0].is_admin == 1 || user_id == card_user_id) { //check if the user are a admin or the cards owner is the same as the token owner
								db.query("UPDATE Trash_cards set is_active=1 WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) { //update the db and return
									res.json({"Status":"Okay", "Message": "The card have been activate"});
								});
							}else{ //if the token owner is not a admin and card owner is not the same a token owner
								res.json({"Status":"Error"});
							}
						});
					}else{ // if the card is not in the database - return error
						res.json({"Status":"Error"});
					}
				});
			});
		}else{ //if the token is either the token is not in the db or if it's not active
			res.json({"Status":"Not allow"}); //return that the client is not allow
		}
	});
});

//Delete a card from the db
//Only admins can use it
router.delete('/remove/:card_nr', function(req, res) { //Path: /api/cards/remove/(card_nr)
	var card_nr = req.params.card_nr; //Get the giving card_nr
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("DELETE FROM Trash_cards WHERE card_nr = "+db.escape(card_nr), function(err, result) { // Delete the card form the db and return
							console.log("User has delete can with ID: "+card_nr);
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

//Create a new card in the database
//Only admins can use it
//Needs: card_nr:Int
router.put('/create', function(req, res) {  //Path: /api/cards/create
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty("card_nr")) { //check if it has all that is need or else send a error to user
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) { //Get card information
							if(result.length > 0) { //Check if the card is in the DB or else error and return
								var msg = "Card number is already been used";
								res.json({"Status":"Error", "Message": msg});
							}else{ //if the card is not in the db then add it and then return to user
								db.query("INSERT INTO Trash_cards SET ?", got_data, function(err, result) {
									var msg = "The card with the number "+got_data["card_nr"]+" was created";
									console.log(msg);
									res.json({"Status":"Okay", "Message": msg});
								});
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

//Update a card by a giving card number
//Can only be used by tokens from admins
//Needs: card_nr:Int
router.post('/update', function(req, res) {
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty("card_nr")) { //check if it has all that is need or else send a error to user
		var msg = "The api can't beused with out the values for: card_nr";
		console.log(msg);
		res.json({"Status":"Error", "Message":msg});
	}
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("SELECT * FROM Trash_cards WHERE card_nr="+db.escape(got_data["card_nr"]), function(err, result) { //Get card information
							if(result.length < 1) { //if the card is not in the DB - give a error and then return
								var msg = "The card number is no in the database - Please create it before updatering it";
								res.json({"Status":"Error", "Message": msg});
							}else{ //if it is there - update it and return
								db.query("UPDATE Trash_cards SET ? WHERE card_nr="+db.escape(got_data["card_nr"]), got_data, function(err, result) {
									var msg = "The card with the number "+got_data["card_nr"]+" was updated";
									console.log(msg);
									res.json({"Status":"Okay", "Message": msg});
								});
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