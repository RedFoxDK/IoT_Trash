var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();

var db = {};


router.post('/insert',function(req,res){
	var can_serial = req.body.hardware_serial;
	var data = req.body.payload_fields;
	var time = req.body.metadata.time;
	var time_obj = {};
	
	time_obj[time] = data;
	
	db[can_serial] = time_obj;
	
	console.log(db);
	res.json(db);
	//{"Status":"Okay"}
});


module.exports = router;