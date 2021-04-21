
const express = require("express");
const mongoose = require('mongoose');
const argon2 = require("argon2");

const router = express.Router();


//
// User schema and model
//

//name is the username of the user

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  record: Number
})






// This is a hook that will be called before a user record is saved,
// allowing us to be sure to salt and hash the password first.
userSchema.pre('save', async function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password'))
    return next();

  try {
    // generate a hash. argon2 does the salting and hashing for us
    const hash = await argon2.hash(this.password);
    // override the plaintext password with the hashed one
    this.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});



// This is a method that we can call on User objects to compare the hash of the
// password the browser sends with the has of the user's true password stored in
// the database.
userSchema.methods.comparePassword = async function(password) {
  try {
    // note that we supply the hash stored in the database (first argument) and
    // the plaintext password. argon2 will do the hashing and salting and
    // comparison for us.
    const isMatch = await argon2.verify(this.password, password);
    return isMatch;
  } catch (error) {
    return false;
  }
};



// This is a method that will be called automatically any time we convert a user
// object to JSON. It deletes the password hash from the object. This ensures
// that we never send password hashes over our API, to avoid giving away
// anything to an attacker.
userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  delete obj.email;
  return obj;
}




// create a User model from the User schema
const User = mongoose.model("User", userSchema);

/* Middleware */

// middleware function to check for logged-in users
const validUser = async (req, res, next) => {
  if (!req.session.userID)
    return res.status(403).send({
      message: "not logged in"
    });
  try {
    const user = await User.findOne({
      _id: req.session.userID
    });
    if (!user) {
      return res.status(403).send({
        message: "not logged in"
      });
    }
    // set the user field in the request
    req.user = user;
  } catch (error) {
    // Return an error if user does not exist.
    return res.status(403).send({
      message: "not logged in"
    });
  }

  // if everything succeeds, move to the next middleware
  next();
};




/* API Endpoints */

//add a user
router.post('/', async (req, res) => {
  console.log(req.body);
  try {
    if (!req.body.email || !req.body.name || !req.body.password)
      return res.status(400).send({
        message: "username, email and password are required"
      });


   //check if a username or email already exists and send a 403
   const previousUser = await User.findOne({ name: req.body.name});
   const previousEmailUser = await User.findOne({email: req.body.email});
   if (previousUser) {
     return res.status(403).send({
       message: "username taken"
     });
   }
   if (previousEmailUser) {
     return res.status(403).send({
       message: "email already has an account"
     });
   }


   let user = new User({
     name: req.body.name,
     password: req.body.password,
     email: req.body.email,
     record: 0,
    });


    await user.save();

    // set user seesion info
    req.session.userID = user._id;

    return res.send({
      user: user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});



//login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });

    if (!user) {
      res.sendStatus(404);
      return;
    }
    if (!await user.comparePassword(req.body.password)) {
      res.sendStatus(403).send({
        message: "incorrect password"
      });
      return;
    }
     
    //set user session infomation
    req.session.userID = user._id;
 
    return res.send({
      user: user
    });

  } catch (error) {
     console.log(error);
     return res.sendStatus(500);
  }
});



//---------------------------------------------------------------------------------------------------------------------------
//get a list of users
router.get('/list', async (req, res) => {
  try {
    let users = await User.find();
    res.send(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

});
//------------------------------------------------------------------------------------------------------------------------------




//get a user
router.get('/:id', async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id});
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



router.get('/', validUser, async (req, res) => {
  try {
    res.send({
      user: req.user
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});





//delete a user
router.delete('/terminate', validUser, async(req, res) => {
  console.log("Deleting User " + req.user.name);
  try {
    await User.deleteOne({ name:req.user.name});
    res.sendStatus(200);
  } catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});


//log out
router.delete('/', async(req, res) => {
  try {
    req.session = null;
    res.sendStatus(200);
  } catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});



module.exports = {
  routes: router,
  model: User,
  valid: validUser
};























