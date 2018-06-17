const express = require('express');
var bodyParser = require("body-parser");


var user_route = require('./api_calls/user');
var cans_route = require('./api_calls/cans');
var waste_log_route = require('./api_calls/waste_log');
var user_type_route = require('./api_calls/user_type');
var cans_type_route = require('./api_calls/cans_type');
var cards_route = require('./api_calls/cards');

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
app.use('/api/user_type', user_type_route);
app.use('/api/cans_type', cans_type_route);
app.use('/api/cards', cards_route);


app.listen(4000, () => console.log('App is listening on port 4000!'));