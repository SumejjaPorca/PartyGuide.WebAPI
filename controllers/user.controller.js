var express    = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('user') // User model
var passHash = require('password-hash');
var jwt = require('jsonwebtoken');
var config = require('../config');
var authProvider = require('../providers/auth');
var registrationProvider = require('../providers/registration');

// controller will be exported and used as Router
var UserCtrl = express.Router()


// Get current user
authProvider.authorize(UserCtrl, 'get', '/', function(req,res){
  var user = req.user;
  res.json(user);
});

// Create new user, 404 if new req body has validation errors
UserCtrl.post('/register', registrationProvider.registerUser);
UserCtrl.post('/confirm-email', registrationProvider.confirmEmail);

/* function (req, res){
  //User
  if (req.body.superadmin) {
    delete req.body.superadmin;
  }

  if (req.body.password) {
      req.body.password = passHash.generate(req.body.password);
  }

  var user = new User(req.body);
  user.save().then(function(newUser){

    res.json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      adminOf: newUser.adminOf
    });
  }, function(err){
    res.status(404).json(err);
  });

});*/

// POST {"username":<username>,"password":<password>}
UserCtrl.post('/login', authProvider.getToken);


module.exports = UserCtrl
