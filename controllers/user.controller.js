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
UserCtrl.post('/request-reset-pass', registrationProvider.requestResetPassword);
UserCtrl.post('/reset-pass', registrationProvider.resetPassword);

// POST {"username":<username>,"password":<password>}
UserCtrl.post('/login', authProvider.getToken);


module.exports = UserCtrl
