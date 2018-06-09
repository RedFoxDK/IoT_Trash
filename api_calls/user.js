var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();

var tokens = {"1": {"id": 1}, "2": {"id": 2}, "3": {"id": 3},"4": {"id": 4}};
var names = {"1": {"name": "a"}, "2": {"name": "b"}, "3": {"name": "c"},"4": {"name": "d"}};

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



module.exports = router;
