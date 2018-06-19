var fs = require('fs');
var exports;

exports.error_msg = function(req, res, type_id, msg, d_msg, data) {
	
	var path = req.originalUrl;
	var ip = (req.headers['x-forwarded-for'] ||
			 req.connection.remoteAddress ||
			 req.socket.remoteAddress ||
			 req.connection.socket.remoteAddress).split(",")[0];
	
	var log_type = get_type(type_id);
	
	console_write(log_type.type, path, ip, d_msg, msg);
	var resp = {"Status":log_type.status_id, "Status_Text":log_type.status};
	
	if (msg != 0) resp["Package_messages"] = msg;
	if (data) resp["Package_data"] = data;
		
	res.status(log_type.http).json(resp);
};

function get_type(type_id) {
	var obj = {http: 0, type: "Log", status: "Okay"};
	
	switch (type_id) {
		case 1: //everything is okay
			obj.http = 200;
			obj.status_id = 1;
			obj.type = "Log";
			obj.status = "Okay";
			break;
		case 2: //Not allow acess
			obj.http = 401;
			obj.status_id = 0;
			obj.type = "Warning";
			obj.status = "Error";
			break;
		case 3: //User did make a error
			obj.http = 404;
			obj.status_id = 0;
			obj.type = "Warning";
			obj.status = "Error";
			break;
		default: //Server did make a error
			obj.http = 501;
			obj.status_id = 0;
			obj.type = "Error";
			obj.status = "Error";
			break;
	}
	
	return obj;
};


// Write to a log file
function console_write(type, route, client_ip, d_msg, u_msg) {
	var path = "./logs/"; // path to the logs
	
	if(!fs.existsSync(path)) { //Create folder if it is not there
		fs.mkdirSync(path); 
	}
	
	path += log_time(true); // the file name (the date)
	path += ".txt"; // file type
		
	if (!fs.existsSync(path)) { // check if the file already exist - else create it
		var headlines = "Time \t - \t Type \t - \t Route \t - \t IP \t - \t Developer Message \t - \t User Message\n";
		fs.appendFile(path, headlines, function (err) {
			if (err) { // throw error if something bad happens
				throw err;
				
			} 
		});
	}
	
	if (u_msg == 0) {
		u_msg = "No message";
	}
	
	// begin on the log line
	var logs = log_time(0); //get time for the log
	logs += "\t - \t" + type; // what type of log it is
	logs += "\t - \t" + route; // where the client are
	logs += "\t - \t" + client_ip; // client IP - in case of hacking attempt 
	logs += "\t - \t" + u_msg; // the message, that the user got 
	logs += "\t - \t" + d_msg; // message for developers
	
	fs.appendFile(path, logs+"\n", function (err) {
		if (err) {
				throw err;
			} 
	});
	
	var logs = log_time(0); //get time for the log
	logs += " - " + type; // what type of log it is
	logs += " - " + route; // where the client are
	logs += " - " + client_ip; // client IP - in case of hacking attempt 
	logs += " - " + u_msg; // the message, that the user got 
	logs += " - " + d_msg; // message for developers
	
	switch (type.toUpperCase()) {
		case "LOG": 
			console.log(logs);
			break;
		case "ERROR":
			console.error(logs);
			break;
		case "WARNING":
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
		date += "." + d.getMilliseconds();
	}
	
	return date;
};

module.exports = exports;

