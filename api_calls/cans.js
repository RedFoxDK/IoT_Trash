var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");
var datetime = require('node-datetime');
var request = require('request');


router.post('/insert',function(req,res){
	var can_serial = req.body.hardware_serial;
	var got_data = req.body.payload_fields;
	var new_card = req.body.payload_fields.new_card;
	var got_time = datetime.create(req.body.metadata.time).getTime();
	
	if (got_data.length < 1) {
		res.json({"Status":"Okay"});
	}else{
		if (new_card == 1) {
			var card_nr = got_data["user_id"];
			var download_link = req.body.downlink_url;
			var port = req.body.port;
			var dev_id = req.body.dev_id;
			
			var obj = {"dev_id":dev_id, "port":port, "confirmed":false};

			db.query("SELECT * FROM Trash_cards WHERE is_active = 1 AND card_nr="+db.escape(card_nr), function(err, result) {	
				var answer = "0";
				if (result.length > 0) {
					answer = "1";
				}
				var test = new Buffer(answer);
				answer = test.toString('base64');
				obj["payload_raw"] = answer;
				
				var options = {url:download_link, 'content-type': 'application/json', body: JSON.stringify(obj)};

				request.post(options, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						console.log("New card infomation have been send");
					}
				});
			});
			res.json({"Status":"Okay"});
		}else{
			delete got_data["new_card"];
			var can_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial);
			db.query(can_sql, function(err, result) {
				
				if (result.length > 0) {
					var from_db = result[0];
					var can_query = {"contect_weight":from_db.contect_weight+got_data.waste_amount, "last_hear_from":got_time};
					got_data['time'] = got_time;
					got_data['can_id'] = from_db.id;
					
					db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) {
						
						db.query("UPDATE Trash_cans SET ? WHERE serial_nr ="+db.escape(can_serial), can_query, function(err, result) {
							res.json({"Status":"Okay"});
							console.log("Cans/insert - done");
						});
					});
				}else{
					var msg = "Could not find following Can Serialnr: " + can_serial;
					res.json({"Status":"Error", "Message":msg});
				}
			});
		}
	}
});

router.get('', function(req,res){
	db.query('SELECT * FROM Trash_cans', function (err, rows) {
		if (err) throw err;
		res.send(rows);
	});
});

router.put('/create', function(req,res){
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	if (!got_data.hasOwnProperty("serial_nr") || !got_data.hasOwnProperty("cans_type_id")) {
		var msg = "Couldn't find either the can's serial nr orthe cans type";
		console.log(msg);
		res.json({"Status":msg});
	}else{
		var can_serial = got_data["serial_nr"];
		var can_type = got_data["cans_type_id"];

		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result.length > 0) {
							if (result[0].is_admin == 1) {
								var lookup_sql = "SELECT * FROM Trash_cans WHERE serial_nr = "+db.escape(can_serial);
								db.query(lookup_sql, function(err, result) {
									if (result.length < 1) {
										db.query('INSERT INTO Trash_cans SET ?', got_data, function(err, result) {
											console.log("Can create with serial number: " + can_serial);
											res.json({'Status':"Okay", 'Massage':'Can created'});
										});
									}else{
										res.json({"Status":"Error"});
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
	}
});

router.post('/update/:serial_nr', function(req,res){
	var serial_nr = req.params.serial_nr;
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	if (got_data.hasOwnProperty("id")) {
		delete got_data["id"];
	}
	if (got_data.hasOwnProperty("serial_nr")) {
		delete got_data["serial_nr"];
	}
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result.length > 0) {
						if (result[0].is_admin == 1) {
							db.query("UPDATE Trash_cans SET ? WHERE serial_nr = "+db.escape(serial_nr), got_data, function(err, result) {
								console.log("User has update can with serial number: " + serial_nr);
								res.json({'Status':"Okay", 'Massage':'Can updated'});
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

router.delete('/remove/:serial_nr', function(req,res){
	var serial_nr = req.params.serial_nr;
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
							db.query("DELETE FROM Trash_cans WHERE serial_nr = "+db.escape(serial_nr), function(err, result) {
								console.log("User has delete can with serial number: " + serial_nr);
								res.json({'Status':"Okay", 'Massage':'Can has been deleted'});
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


module.exports = router;