const express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var db = require("./db");


var user_route = require('./api_calls/user');
var cans_route = require('./api_calls/cans');
var waste_log_route = require('./api_calls/waste_log');

const app = express();


var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./api_docs/swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => res.send('Hello World!'));


app.use('/api/user', user_route);
app.use('/api/cans', cans_route);
app.use('/api/waste_log', waste_log_route);


app.listen(3000, () => console.log('App is listening on port 3000!'));

