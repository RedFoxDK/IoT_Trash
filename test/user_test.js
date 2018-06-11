var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();

var tokens = {"1": {"id": 1}, "2": {"id": 2}, "3": {"id": 3},"4": {"id": 4}};
var names = {"1": {"name": "a"}, "2": {"name": "b"}, "3": {"name": "c"},"4": {"name": "d"}};

router.get('/cake', function(req,res){
    console.log("cake");
    res.send('Okay');
});

router.get('',function(req,res){
    var token = req.get('token');
    var answer;

    if (token != null) {
      answer = names[tokens[token].id];
    }else{
      answer = { msg:"Sorry Body" };
    }
    res.json(answer);
    console.log(answer);

});


router.use(function(req,res){
});



var users = {"1": {"id": "1", "name": "Martin", "user_type_id": "2", "is_admin": "1", "secret": "1234"}, "2": { "id": "2", "name": "Jonas", "user_type_id": "1", "is_admin": "0", "secret": "5678"}};




router.get('/', function(req,res){
	var api_token = req.get('api_token');
	 /*
	 * Check the API frome MYSQL and see if the person is a admin
	 */
	 
	 var answer;
	 
	 answer = get_user_info(api_token);
	 
	 res.json(answer);
});


router.get('/:id', function(req,res){
	var api_token = req.get('api_token');
	 /*
	 * Check the API frome MYSQL and see if the person is a admin
	 */
	 
	 var id = req.params.id;
	 
	 console.log(api_token);
	 
	 var answer;
	 if(api_token == '123') {
		 answer = get_user_info(id);
	 }else{
		 answer = { msg:"Sorry Body" };
	 }	 
	 res.json(answer);
});



router.get('/cake', function(req,res){
    console.log("cake");
    res.send('Okay');
});

router.use(function(req,res){
    var token = req.get('token');
    var answer;

    if (token != null) {
      answer = names[tokens[token].id];
    }else{
      answer = { msg:"Sorry Body" };
    }
    res.json(answer);
    console.log(answer);

});


function get_user_info(id) {
	return users[id];
}









module.exports = router;
