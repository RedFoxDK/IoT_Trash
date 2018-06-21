var randomstring  = require("randomstring"); //Module for creating randomstring by only giving a lenght
var crypto = require('crypto'); //Module for use the hash functions

var exports; // create the variable for exporting the functions

const salt = "3130545f54726135685832303138"; //Custom add salt for adding security of the hash

//Give a random string (with numbers and letters) that is 64 in lenght
exports.random = function() { 
	return randomstring.generate(64);
};

//Give a random string (with numbers and letters) that is bewteen 16 and 64 in lenght for use to api_tokens
exports.api_random = function() {
	var max = 64; //set max characters
	var min = 16; //set min characters
	var random_number = Math.floor(Math.random()* (max-min)) + min; // gerente a random number
	
	if (random_number > max) { // check if the random number is over max or else pull it back to under the max 
		random_number = random_number - min; 
	}
	
	return randomstring.generate(random_number); // genate the random string on X length
};

//Give a hash'et variable from a givend string
exports.hash = function(pass) {
	var hash = crypto.createHmac('sha512', salt); //definde what kind of hash is used and add the salt
	hash.update(pass); //hash the giving string
	
	return hash.digest('hex'); //return the hash in hex format
};

//Check if a giving pass, match the hash in the database
exports.match_hash = function(got_pass, db_hash) {
	var hash = crypto.createHmac('sha512', salt); //definde what kind of hash is used and add the salt
	hash.update(got_pass); //hash pass that was givingen
	
	got_pass = hash.digest('hex'); // change the hash to hex format
	
	if (got_pass == db_hash) { //check if the match. If they do, return 1 or else 0
		return 1;
	}else{
		return 0;
	}
}


module.exports = exports;//returne the db connction for use