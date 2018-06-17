var fs = require('fs');
var exports;

exports.error_msg = function(res, msg, d_msg) {
	var c_msg = "User got a error! - Message: " + msg;
	console.error(c_msg);
	if (d_msg !== null) {
		d_msg = "More information:\n"+d_msg;
		console.error(d_msg);
	}
	res.json({"Status":"Error", "Message":msg});
};

// Write to a log file
exports.console_write = function(type, route, client_ip, d_msg, u_msg) {
	var path "../logs/"; // path to the logs
	path += log_time(true); // the file name (the date)
	path += ".txt"; // file type
	
	if (!fs.existsSync(path)) { // check if the file already exist - else create it
		var headlines = "Time \t - \t Type \t - \t Route \t - \t IP \t - \t Developer Message \t - \t User Message";
		fs.appendFile(path, headlines, function (err) {
			if (err) { // throw error if something bad happens
				throw err;
				exit;
			} 
		});
	}
	
	// begin on the log line
	var logs = log_time(0); //get time for the log
	logs += "\t - \t" + type; // what type of log it is
	logs += "\t - \t" + route; // where the client are
	logs += "\t - \t" + client_ip; // client IP - in case of hacking attempt 
	logs += "\t - \t" + d_msg; // message for developers
	logs += "\t - \t" + u_msg; // the message, that the user got 
	
	fs.appendFile(path, logs, function (err) {
		if (err) {
				throw err;
				exit;
			} 
	}
	
	switch (type.toUpperCase()) {
		case LOG: 
			console.log(logs);
			break;
		case ERROR:
			console.error(logs);
			break;
		case WARN:
			console.warn(logs);
			break;
		default:
			console.log(logs);
			break;
	}
};

function log_time(is_for_name) {
	var date;
	var d = new Date();
	
	date = d.getFullYear();
	date += "-" + (d.getMonth()+1);
	date += "-" + d.getDate();
	if (!is_for_name) {
		date += " " + d.getHours();
		date += ":" + d.getMinutes();
		date += ":" + d.getSeconds();
		date += "." + d.getMilliseconds():
	}
	
	return date;
}

module.exports = exports;

