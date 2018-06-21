var express = require("express"); //Module for route the http path 
var bodyParser = require("body-parser"); //For getting the body of the request 
var db = require("../functions/db"); //The database conncontion
var datetime = require('node-datetime'); //Module for converting datetime into timestamp
var request = require('request'); //Module for sending http request
var router = express.Router(); //create the variable for routing the http  


//Insert new data from the cans
//Should only be cans that is using this called
//Needs: {dev_id:String, hardware_serial:String, port:Int, download_url:String, metadata:{time:datetime}, payload_fields:{bio_detection:Int, metal_detection:Int, user_id:Int, waste_amount:Int}}
router.post('/insert',function(req,res){ //Path: /api/cans/insert
	var can_serial = req.body.hardware_serial; //Get the can serial number
	var got_data = req.body.payload_fields; //get user data from the arduinos
	var new_card = req.body.payload_fields.new_card;
	var got_time = datetime.create(req.body.metadata.time).getTime(); //get the time and then convert into timestamp
	
	if (got_data.length < 1) { // check if there is no data and then return
		res.json({"Status":"Okay"});
	}else{
		if (new_card == 1) { //check if the can got a new card
			var card_nr = got_data["user_id"]; //get card number
			var download_link = req.body.downlink_url; //get url for sending data
			var port = req.body.port; //get port for HTTP packet
			var dev_id = req.body.dev_id; //get the dev_id
			
			var obj = {"dev_id":dev_id, "port":port, "confirmed":false}; //create the sending JSON array
			
			db.query("SELECT * FROM Trash_cards WHERE is_active = 1 AND card_nr="+db.escape(card_nr), function(err, result) { //check if the card is in the db and active
				var answer = "0";
				if (result.length > 0) {
					answer = "1";
				}
				var convert = new Buffer(answer); 
				answer = convert.toString('base64'); //convert to base64
				obj["payload_raw"] = answer; //insert into the sending JSON
				
				var options = {url:download_link, 'content-type': 'application/json', body: JSON.stringify(obj)}; //Set up the options for the request 

				request.post(options, function (error, response, body) { //Send the JSON array to the can
					if (!error && response.statusCode == 200) { //check if anything was okay
						console.log("New card infomation have been send");
					}
				});
			});
			res.json({"Status":"Okay"}); //return
		}else{ //if there is no new card
			delete got_data["new_card"]; //delete new card key from the JSON array
			var can_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial); //make the SQL for getting all cans with that serial number
			db.query(can_sql, function(err, result) { //Do the query
				if (result.length > 0) { //if there is a can with that serial number
					var from_db = result[0]; //Got from Database
					var can_query = {"contect_weight":from_db.contect_weight+got_data.waste_amount, "last_hear_from":got_time}; //add the new waste and caulte the cans total
					got_data['time'] = got_time; //insert time into the query
					got_data['can_id'] = from_db.id; //add the can_id
					
					db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) { //insert into the waste_log
						
						db.query("UPDATE Trash_cans SET ? WHERE serial_nr ="+db.escape(can_serial), can_query, function(err, result) { //update the can
							res.json({"Status":"Okay"});
							console.log("Cans/insert - done");
						});
					});
				}else{ //if the can is not in the database
					var msg = "Could not find following Can Serialnr: " + can_serial;
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}
});

//Get all cans in the databse
router.get('', function(req,res){ //Path: /api/cans/
	db.query('SELECT * FROM Trash_cans', function (err, rows) {
		if (err) throw err;
		res.send(rows);
	});
});

//Create a new can in the DB
//Only the admins can do this
//Needs: serial_nr:String, cans_type_id:Int
router.put('/create', function(req,res){ //Path: /api/cans/create
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty("serial_nr") || !got_data.hasOwnProperty("cans_type_id")) { //check if it has all that is need or else send a error to user
		var msg = "Couldn't find either the can's serial nr orthe cans type";
		console.log(msg);
		res.json({"Status":msg});
	}else{ //if all needs is there
		var can_serial = got_data["serial_nr"];
		var can_type = got_data["cans_type_id"];
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
			if (result.length > 0) { // if the token is in the db and is activate
				user_id = result[0].user_id; //get user_id for token
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
					user_type_id = result[0].user_type_id; //get user type
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
						if (result[0].is_admin == 1) { //check if tokens owner is a admin
							var lookup_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial); //Get cans information
							db.query(lookup_sql, function(err, result) {
								if (result.length < 1) { // if cans is not in the db
									db.query('INSERT INTO Trash_cans SET ?', got_data, function(err, result) { //create the can and return to client
										console.log("Can create with serial number: " + can_serial);
										res.json({'Status':"Okay", 'Massage':'Can created'});
									});
								}else{ //if the cans is in the db - make a error and then return to user
									res.json({"Status":"Error"});
								}
							});
						}else{ //if the token owner is not a admin
							res.json({"Status":"Error"});
						}
					});
				});
			}else{//if the token is either the token is not in the db or if it's not active
				res.json({"Status":"Not allow"}); //return that the client is not allow
			}
		});
	}
});


//Update a can with the giving serial_nr
//only admins can used
router.post('/update/:serial_nr', function(req,res){ //Path: /api/cans/update/(serial_nr)
	var serial_nr = req.params.serial_nr;
	var got_data = req.body; //Get request body
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	if (got_data.hasOwnProperty("id")) { //check if the key is in the JSON array, if so then delete the key
		delete got_data["id"];
	}
	if (got_data.hasOwnProperty("serial_nr")) { //check if the key is in the JSON array, if so then delete the key
		delete got_data["serial_nr"];
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("UPDATE Trash_cans SET ? WHERE serial_nr = "+db.escape(serial_nr), got_data, function(err, result) { //Update the can in the db and return
							console.log("User has update can with serial number: " + serial_nr);
							res.json({'Status':"Okay", 'Massage':'Can updated'});
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


//Remove a can from the db
//Only admins can use this
router.delete('/remove/:serial_nr', function(req,res){ //Path: /api/cans/remove/(serial_nr)
	var serial_nr = req.params.serial_nr; //Get giving serial_nr
	var api_token = req.get('X-API-TOKEN'); //Get the token i the HTTP header
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) { //check if the token is in the db and activate
		if (result.length > 0) { // if the token is in the db and is activate
			user_id = result[0].user_id; //get user_id for token
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) { //get user information for token's owner
				user_type_id = result[0].user_type_id; //get user type
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){ //Get the user type for the token's owner 
					if (result[0].is_admin == 1) { //check if tokens owner is a admin
						db.query("DELETE FROM Trash_cans WHERE serial_nr = "+db.escape(serial_nr), function(err, result) { //Delete the can in the db
							console.log("User has delete can with serial number: " + serial_nr);
							res.json({'Status':"Okay", 'Massage':'Can has been deleted'});
						});
					}else{ //if not then return with a error
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