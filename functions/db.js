var mysql = require('mysql'); //Module to use MySQL

var con = mysql.createConnection({ //create the connection 
  host: "localhost", //Database host
  user: "root", //username
  password: "x232", //Password
  database: "IoT_Trash" //what database
});

con.connect(function(err) { //try to connect to the MySQL database
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con; //returne the db connction for use