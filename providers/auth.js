var mongoose = require('mongoose');
var User = mongoose.model('user') // User model
var passHash = require('password-hash');
var jwt = require('jsonwebtoken');
var config = require('../config');


module.exports = {};

module.exports.getToken = function(req,res){

  // username required
  if(!req.body.username){
    res.status(400).json({success:false, username:"required", message:"username required"});
  }

  // password is required
  if(!req.body.password){
    res.status(400).json({success:false, username:"required", message:"password required"});
  }

  // find user with this username
  User.findOne({ $or: [{username:req.body.username},{email:req.body.username}] }).then(function(user){
    // check does user exist
    if (!user){
      res.status(400).json({ success:false, username:"wrong", password:"wrong", message:"Wrong username or password."});
    } else if(!user.emailConfirmed){
      res.status(400).json({success:false, email:"not confirmed", message:"Email isn't confirmed."})
    } else {
        // check does password match
      if(!passHash.verify(req.body.password, user.password)){
        // password doesn't match
        res.status(400).json({success:false, username:"wrong", password:"wrong", message:"Wrong username or password."});
      } else {
        // password match
        if(user.banned){
          return res.status(401).json({
            success:false,
            banned:true,
            message:"You are currently banned."
          });
        }
        // get token. JWT's payload has only user's id
        var token = jwt.sign({id:user.id}, config.secret, {
          expiresIn: config.tokenExpiration
        });

        // return token
        res.status(200).json({
          success: true,
          message: "Login successful.",
          token: token,
          username: user.username
        });
      }
    }

  }, function(err){
    // Database error
    throw err;
  });
}

// middleware for authetication. Check for token in body, query or header
module.exports.middleware = function(req,res,next){
  // get token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(!token){
    // there is no token
    res.status(401).json({
      success:false,
      noToken:true,
      message:"No token provided."
    });

  } else {
    // check token
    jwt.verify(token, config.secret, function(err, decoded){
      if(err){
        if (err.name == "TokenExpiredError"){
          // Token expired
          return res.status(401).json({
            success:false,
            tokenExpired:true,
            message: "Token expired."
          });
        } else {
          // token isn't valid
          return res.status(401).json({
            success:false,
            tokenNotValid:true,
            message: "Token not valid."
          });
        }
      }
      // There is no errors

      // If token is valid and succesfully decoded, find user and save it for use in other routes
      User.findOne({_id:decoded.id}).then(function(user){
        if (!user){
          return res.status(401).json({
            success:false,
            message:"Wrong user."
          });
        } else {
          // User found - save it for later use
          if(user.banned){
            return res.status(401).json({
              succes:false,
              banned:true,
              message:"You are currently banned."
            })
          }
          delete user.password;
          req.user = user;
          next();
        }

      }, function(err){ // Database error
        throw err;
      });
    });
  }
}

// Authorize some request
module.exports.authorize = function(router, method, route, cb){
  router[method](route, module.exports.middleware);
  router[method](route, cb);
}
