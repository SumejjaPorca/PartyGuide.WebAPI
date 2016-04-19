var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose);
var config = require('../config');
var passHash = require('password-hash');
var merge = require('merge');
var User = mongoose.model('user');

module.exports = {}

// sync version of hashing function
module.exports.hashFunction = function hashFunction(password, tempUserData, insertTempUser, callback) {
  var hash = passHash.generate(password);
  return insertTempUser(hash, tempUserData, callback);
};

// @{param} function callback(err,options) - optional paramether
// see node-email-verification API configure function for callback description
module.exports.configure = function(callback){
  var options = merge(config.emailConfirmation, {
    persistentUserModel: User,
    hashingFunction: module.exports.hashFunction,
    emailFieldName: 'email',
    passwordFieldName: 'password'
  });

  nev.configure(options, callback);
  nev.generateTempUserModel(User,function(err, tempUserModel){
    if(err){
      console.log("Error: " + err);
      return;
    }

    console.log("temp model generated: " + (typeof tempUserModel == 'function'));
  });
}


// POST method, expect new User data
module.exports.registerUser = function(req,res){
  //User
  if (req.body.superadmin) {
    delete req.body.superadmin;
  }

  if (req.body.password) {
      req.body.password = passHash.generate(req.body.password);
  }
  var newUser = new User(req.body);

  User.find({$or:[{email:newUser.email, username:newUser.username}]}).then(function(users){
    if(users.length > 0){
      var err = { message: "" };
      users.forEach(function(user){
        if(user.username == newUser.username){
          console.log("isti username")
          err.username = "Already exists.";
          err.message += "Username already taken. ";
        }

        if(user.email == newUser.email){
          console.log("isti email")
          err.email = "Already exists.";
          err.message += "Email already taken. ";
        }
      });

      return res.status(404).json(err);
    }
    else {
      nev.createTempUser(newUser, function(err, newTempUser){
        if (err)
          return res.status(500).json({error:err});

        // new user created
        if (newTempUser) {
          var URL = newTempUser[nev.options.URLFieldName];

          nev.sendVerificationEmail(newTempUser.email, URL, function(err, info) {
            if (err) {
              return res.status(404).send({error:err, message:'ERROR: sending verification email FAILED'});
            }
            return res.json({
              message: 'An email has been sent to you. Please check it to verify your account.',
              info: info
            });
          });

        // user already exists in temporary collection!
        } else {
          return res.json({
            message: 'You have already signed up. Please check your email to verify your account.'
          });
        }
      }); // .createTempUser END
    }
  }); // User.find END

}

// POST method, expect { code: <confirmation code got by email> }
module.exports.confirmEmail = function(req,res){
  if(!req.body.code){
    return res.status(404).json({message:'Field \'code\' required.'});
  }
  try {
    nev.confirmTempUser(req.body.code, function(err, user) {
      if (err){
        return res.status(404).json({error:err,message:'Email confirmation error.'})
      }

      // user was found!
      if (user) {
        return res.json({message:"Email confirmed."});

      } else {
        return res.status(404).send({message:"Confirmation code expired or invalid."});
      }
    });
  } catch (e) {
    return res.status(404).send({error:e});
  }

}
