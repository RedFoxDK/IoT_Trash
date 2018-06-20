var randomstring  = require("randomstring");
var crypto = require('crypto');

var exports;

const salt = "3130545f54726135685832303138";

exports.random = function() {
	return randomstring.generate(64);
};

exports.api_random = function() {
	var max = 64;
	var min = 16;
	var random_number = Math.floor(Math.random()* (max-min)) + min;
	
	if (random_number > 64) {
		random_number = random_number - min;
	}
	
	return randomstring.generate(random_number);
};

exports.hash = function(pass) {
	var hash = crypto.createHmac('sha512', salt);
	hash.update(pass);
	
	return hash.digest('hex');
};

exports.match_hash = function(got_hash, db_hash) {
	var hash = crypto.createHmac('sha512', salt);
	hash.update(got_hash);
	
	got_hash = hash.digest('hex');
	
	if (got_hash == db_hash) {
		return 1;
	}else{
		return 0;
	}
}




module.exports = exports;