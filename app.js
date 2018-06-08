const express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var mysql = require('mysql');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/user', function (req, res) {
  res.send('Got a GET request at /user\n')
  console.log('Got a GET request at /user - user: ' + req.body.user);
});

app.post('/user', function(req, res) {
  
  var name = req.body.user;
  var token = req.get('token');
  res.send('Ok ');
});

app.listen(port, () => console.log('Example app listening on port '+port+'!'));

