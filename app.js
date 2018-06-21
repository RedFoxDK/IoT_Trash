const express = require('express'); //Module for route the http path 
var bodyParser = require("body-parser");  //For getting the body of the request 

//all the routers for the other files
var user_route = require('./api_calls/user');
var cans_route = require('./api_calls/cans');
var waste_log_route = require('./api_calls/waste_log');
var user_type_route = require('./api_calls/user_type');
var cans_type_route = require('./api_calls/cans_type');
var cards_route = require('./api_calls/cards');
var api_token_route = require('./api_calls/api_token');



const app = express(); // create the webapp

//Create and route for the Swagger API
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./api_docs/swagger.json');


app.get('/', (req, res) => res.redirect('/api-docs')); //rereoute any from / to /api-doces
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //Build the Swagger API doc

//Set up the bodyParser module, so the system can gets the request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//Add all the routes to the web app
app.use('/api/user', user_route);
app.use('/api/cans', cans_route);
app.use('/api/waste_log', waste_log_route);
app.use('/api/user_type', user_type_route);
app.use('/api/cans_type', cans_type_route);
app.use('/api/cards', cards_route);
app.use('/api/api_token', api_token_route);

//Build the app and listin on port 3000
app.listen(3000, () => console.log('App is listening on port 3000!'));