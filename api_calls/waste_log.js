var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../functions/db");
var datetime = require('node-datetime');


router.get('', function(req,res){
	var api_token = req.get('X-API-TOKEN');
	var user_id, user_type_id;
	
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					var sql = "SELECT * FROM Trash_waste_log";
					if (result[0].is_admin != 1) {
						sql += " WHERE user_id="+user_id;
					}
					db.query(sql,function(err, result){
						res.json(result);
					});
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});

router.get('/by_user/:id', function(req,res){
	var id = req.params.id;
	var api_token = req.get('X-API-TOKEN');
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					var sql = "SELECT * FROM Trash_waste_log";
					if (result[0].is_admin != 1 || user_id == id) {
						sql += " WHERE user_id="+user_id;
					}else{
						sql += " WHERE user_id="+id;
					}
					db.query(sql,function(err, result){
						res.json(result);
					});
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});

router.get('/by_can/:id', function(req,res) {
	var id = req.params.id;
	var api_token = req.get('X-API-TOKEN');
	db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
		if (result.length > 0) {
			user_id = result[0].user_id;
			db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
				user_type_id = result[0].user_type_id;
				db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
					if (result[0].is_admin == 1) {
						db.query("SELECT * FROM Trash_waste_log WHERE can_id ="+db.escape(id)+"", function(err, result){
							res.json(result);
						});
					}else{
						res.json({"Status":"Not allow"});
					}	
				});
			});
		}else{
			res.json({"Status":"Not allow"});
		}
	});
});

router.put('/create', function(req,res) { ///// IKKE FÆRDIG ENDNU!!!!!!!!!
	var got_data = req.body;
	var api_token = req.get('X-API-TOKEN');
	if (!got_data.hasOwnProperty('user_id') || !got_data.hasOwnProperty("can_id") || !got_data.hasOwnProperty('waste_amount')) {
		var msg = "The api can't beused with out the values for: user_id, can_id and waste_amount";
		res.json({"Stauts": msg});
	}else{
		if (!got_data.hasOwnProperty('user_id')) {
			got_data["time"] = datetime.create().getTime();
		}else{
			got_data["time"] = datetime.create(got_data["time"]).getTime();
		}
		
		db.query("SELECT * FROM Trash_api_token WHERE is_activate=1 AND api_token="+db.escape(api_token)+" LIMIT 1", function(err, result) {
			if (result.length > 0) {
				user_id = result[0].user_id;
				db.query("SELECT * FROM Trash_user WHERE id="+user_id, function(err, result) {
					user_type_id = result[0].user_type_id;
					db.query("SELECT * FROM Trash_user_type WHERE id="+result[0].user_type_id, function(err, result){
						if (result[0].is_admin == 1) {
							db.query('INSERT INTO Trash_waste_log SET ?', got_data, function(err, result) {
								console.log("Have create a log in the waste log");
								res.json({"Status":"Okay", "Message":"The log has been created"});
							});
						}else{
							res.json({"Status":"Not allow"});
						}	
					});
				});
			}else{
				res.json({"Status":"Not allow"});
			}
		});
	}
});


router.all('*', function(req, res){
  res.status(404).send("Nope");
});


module.exports = router;