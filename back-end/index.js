const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');


//set up express
const app = express();

//set up body parser middleware to conver to JSON and handle URL encoded forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//connect to the mongodb database
mongoose.connect('mongodb://localhost:27017/monsters', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: [
    'secretValue'
  ],
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));







const users = require("./users.js");
app.use("/api/user", users.routes);


const monsters = require("./monsters.js");
app.use("/api/monster", monsters.routes);




app.listen(3000, () => console.log('Server listening on port 3000!'));









