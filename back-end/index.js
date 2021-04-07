const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/monsters', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const multer = require('multer');
const upload = multer({
  dest: '../front-end/public/images/',
  limits: {
    fileSize: 10000000
  }
});


const monsterSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  score: Number,
  level: Number,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
});

const Monster= mongoose.model("Monster", monsterSchema);

const userSchema = new mongoose.Schema({
  name: String,
  path: String,
  password: String,
  email: String,
  record: Number
})

const User = mongoose.model("User", userSchema);

// Upload a photo for a user. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  console.log(req.file);
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/public/images/" + req.file.filename
  });
});


//add a user
app.post('/api/user', async (req, res) => {
  let user = new User({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    path: req.body.path,
    record: req.body.record,
  });
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})


//add a mosnter
app.post('/api/monster/:userID', async (req, res) => {
  
  try {
    let user = await User.findOne({ _id: req.params.userID});
    if (!user) {
      console.log("User not found while adding monster");
      res.send(404);
      return;
    }
    const monster = new Monster({
      name: req.body.name,
      path: req.body.path,
      description: req.body.description,
      type: req.body.type,
      score: 0,
      level: 1,
      user: user
    });
    await monster.save();
    res.send(monster);
  } catch (error) {
    console.log(error);
    res.sendStatus(500)
  }
});

//update a monster
app.put('/api/monster/update/:monsterID', async (req, res) => {
  try {
    let monster = await Monster.findOne({_id: req.params.monsterID});
    let user = await User.findOne({_id: monster.user})
    console.log(user);
    if(!monster) {
      res.sendStatus(404);
      return;
    }
    if(!user) {
      res.sendStatus(404);
      return;
    }
    monster.name = req.body.name;
    monster.description = req.body.description;
    monster.type = req.body.type;
    monster.score = req.body.score;
    monster.level = req.body.level;
    
    if (user.record < monster.score) {
      user.record = monster.score;
      await user.save();
    }

    await monster.save();


    
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});


//get a list of users
app.get('/api/user', async (req, res) => {
  try {
    let users = await User.find();
    res.send(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

});


//get a list of the monsters
app.get('/api/monster', async (req, res) => {
  try {
    let monsters = await Monster.find();
    res.send(monsters);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});


//get a user
app.get('/api/user/:id', async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id});
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});


//get all monsters associated with a user. Id is user._id
app.get('/api/monster/:id', async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id});
    if(!user) {
      res.sendStatus(404);
    }
    let monsters = await Monster.find({user: user});
    res.send(monsters);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});


//delete a user
app.delete('/api/user/:id', async(req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id});
    res.sendStatus(200);
  } catch(error) {
    console.log(error);
    res.sendStatus(200);
  }
});


//delete a monster
app.delete('/api/monster/:id', async (req, res) => {
  try {
    await Monster.deleteOne({ _id: req.params.id });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



app.listen(3000, () => console.log('Server listening on port 3000!'));









