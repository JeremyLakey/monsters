const express = require("express");
const mongoose = require('mongoose');

const router = express.Router();


const users = require("./users.js");
const User = users.model;
const validUser = users.valid;


//Set up monster Schema

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


//add a mosnter
router.post('/', validUser, async (req, res) => {
  
  try {
    let user = await User.findOne({ name: req.user.name});
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
router.put('/:monsterID', async (req, res) => {
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





//get a list of the monsters
router.get('/', async (req, res) => {
  try {
    let monsters = await Monster.find();
    res.send(monsters);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});





//get all monsters associated with a user. Id is user._id
router.get('/:id', async (req, res) => {
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


//get a monster by its _id code
router.get('/code/:id', async (req, res) => {
  try {
    let monster = await Monster.findOne({ _id: req.params.id});
    if(!monster) {
      res.sendStatus(404);
      return
    }
    res.send(monster);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});





//delete a monster
router.delete('/:id', async (req, res) => {
  try {
    await Monster.deleteOne({ _id: req.params.id });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



module.exports = {
  routes: router,
  model: Monster,
};










