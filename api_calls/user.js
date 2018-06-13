var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();

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
	 
	 
	 
	 var answer;
	 if(api_token == '123') {
		 answer = get_user_info(id);
	 }else{
		 answer = { msg:"Sorry Body" };
	 }	

	 console.log(answer);	 
	 res.json(answer);
});


router.put('/new', function(req,res){
	var obj = req.body;
	var len = Object.keys(users).length;
	len++;
	obj["id"] = len;
	
	users[len] = obj;
	var msg = {"Status":"Okay"};
	console.log(users);
	res.json(users);
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
