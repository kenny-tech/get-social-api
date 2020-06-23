const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()

// configure database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// connect to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
})

// create express app
const app = express();

app.use(cors())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '50mb'}));

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to PhotoFeed app."})
});

// require Photos routes
require('./app/router')(app);

const port = process.env.PORT || 3000;

// listen for requests
app.listen(port, () => {
    console.log("Server is listening on port 3000");
});