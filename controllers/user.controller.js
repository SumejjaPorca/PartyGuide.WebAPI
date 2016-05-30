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

UserCtrl.get('/statistics', function(req, res){
  User.count(function(err, c) {
          if(err)
            res.status(400).json(err);
          else
           return res.status(200).json({
             count: c
           });
      });
});

authProvider.authorize(UserCtrl, 'get', '/search/:name', function(req,res){
  var param = new RegExp(req.params.name.replace(/\s+/g,''),'i');
  console.log(param);
  User.find({$or:[{username:param},{email:param}]}).then(function(users){
    res.json(users);
  }).catch(function(err){
    res.status(400).json(err);
  });
});

authProvider.authorize(UserCtrl, 'put', '/:id/ban', function(req,res){
  if(!req.user.superadmin){
    return res.status(401).json({
      success:false,
      notSuperadmin:true,
      message:"You must be superadmin to perform this action."
    });
  }

  User.findOne({_id:req.params.id}).then(function(user){
    if(!user){
      return res.status(400).json({
        user:"wrong",
        message:"There is no user with this ID."
      })
    }

    user.banned = true;
    user.save();

    return res.send();
  });

});

authProvider.authorize(UserCtrl, 'put', '/:id/unban', function(req,res){
  if(!req.user.superadmin){
    return res.status(401).json({
      success:false,
      notSuperadmin:true,
      message:"You must be superadmin to perform this action."
    });
  }

  User.findOne({_id:req.params.id}).then(function(user){
    if(!user){
      return res.status(400).json({
        user:"wrong",
        message:"There is no user with this ID."
      })
    }

    user.banned = false;
    user.save();

    return res.send();
  });

});
module.exports = UserCtrl
