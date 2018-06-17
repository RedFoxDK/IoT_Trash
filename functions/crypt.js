var randomstring  = require("randomstring");
var crypto = require('crypto');

var exports;



exports.random = function() {
	return randomstring.generate(64);
};

exports.hash = function(pass) {
	var salt = "3130545f54726135685832303138";
	var hash = crypto.createHmac('sha512', salt);
	hash.update(pass);
	
	return hash.digest('hex');
};




module.exports = exports;