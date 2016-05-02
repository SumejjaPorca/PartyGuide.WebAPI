var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose);
var config = require('../config');
var passHash = require('password-hash');
var merge = require('merge');
var User = mongoose.model('user');
var ResetPass = mongoose.model('resetpassword');
var ConfirmEmail = mongoose.model('confirmemail');
var randtoken = require('rand-token');
var nodemailer = require('nodemailer');
var moment = require('moment');

module.exports = {}

// sync version of hashing function
module.exports.hashFunction = function hashFunction(password, tempUserData, insertTempUser, callback) {
  var hash = passHash.generate(password);
  return insertTempUser(hash, tempUserData, callback);
};


// POST method, expect new User data
module.exports.registerUser = function(req,res){
  // TODO validate model

  //User
  if (req.body.password) {
      req.body.password = passHash.generate(req.body.password);
  }
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  newUser.save()
  .then(function(user){

    // Make and save confirmation token
    var options = config.emailConfirmation;
    var token = randtoken.generate(options.tokenLength || 48);

    var confirmEmail = new ConfirmEmail({
      userId: user.id,
      confirmToken: token
    });
    console.log(confirmEmail);
    confirmEmail.save().then(function(ce){
      // send email verification email
      console.log(ce);
      var transporter = nodemailer.createTransport(options.transportOptions);

      var codeR = /\$\{CODE\}/g;
      var urlR  = /\$\{URL\}/g;

      // inject newly-created URL into the email's body and FIRE
      var URL = options.verificationURL.replace(codeR, ce.confirmToken),
        mailOptions = JSON.parse(JSON.stringify(options.verifyMailOptions));

      mailOptions.to = user.email;
      mailOptions.html = mailOptions.html.replace(urlR, URL);
      mailOptions.text = mailOptions.text.replace(urlR, URL);

      transporter.sendMail(mailOptions).then(function(emailInfo){
        // verification email sent
        console.log(emailInfo);
        res.status(200).send();
      }).catch(function(err){
        res.status(404).json(err);
      });

    })
    .catch(function(err){
      console.log(err);
      res.status(404).json(err);
    }); // confirmEmail.save - END

  })
  .catch(function(err){
    // TODO check error... check fields, and unique index on username and email.
    console.log(err);
    res.status(400).json(err);
  })

}

// POST method, expect { token: <confirmation code got by email> }
module.exports.confirmEmail = function(req,res){
  if(!req.body.token){
    return res.status(404).json({
      code:'required',
      message:'Field \'code\' required.'
    });
  }

  ConfirmEmail.findOne({confirmToken:req.body.token})
  .then(function(ce){
    if(!ce){ // confirmation token not found
      return res.status(400).json({
        token:'not valid',
        message:"Token isn't valid"
      });

    } else {
      // token found, confirm email and erase token
      // TODO Check token expiration
      var options = config.emailConfirmation;

      var duration = moment.duration(moment().diff(moment(ce.createdAt))).seconds();
      //console.log(duration);

      if(duration >= options.expirationTime){
        return res.status(404).json({
          token:'expired',
          message:"Token expired."
        });
      }

      User.findOne({_id:ce.userId})
        .then(function(user){

          if(!user){
            throw res.status(400).json({
              message:"User doesn't exist."
            });
          }

          user.emailConfirmed = true;

          user.save();
          ce.remove();


          if(options.shouldSendConfirmation == true){

            var transporter = nodemailer.createTransport(options.transportOptions);

            mailOptions = JSON.parse(JSON.stringify(options.confirmMailOptions));

            mailOptions.to = user.email;
            mailOptions.html = mailOptions.html;
            mailOptions.text = mailOptions.text;

            transporter.sendMail(mailOptions).then(function(emailInfo){
              // verification email sent
              console.log(emailInfo);
              res.status(200).send();
            }).catch(function(err){
              res.status(404).json(err);
            });

          } else {
            res.send();
          }
        });
    }
  })
  .catch(function(err){
    res.status(400).json(err);
  });
}

// POST method except { email: <email> }
module.exports.requestResetPassword = function(req,res) {
  if(!req.body.email){
    res.status(404).json({email:"required", message:"Email is required."});
  }

  var options = config.resetPassword;

  var transporter = nodemailer.createTransport(options.transportOptions);

  var sendResetPassEmail = function(email, code, callback) {
    var codeR = /\$\{CODE\}/g;
    var urlR  = /\$\{URL\}/g;

    // inject newly-created URL into the email's body and FIRE
    var URL = options.resetURL.replace(codeR, code),
      mailOptions = JSON.parse(JSON.stringify(options.resetMailOptions));

    mailOptions.to = email;
    mailOptions.html = mailOptions.html.replace(urlR, URL);
    mailOptions.text = mailOptions.text.replace(urlR, URL);

    transporter.sendMail(mailOptions, callback);
  };

  // send mail
  User.findOne({ email:req.body.email }, function(err, user){
    if(!user){
        return res.status(404).json({email:"wrong", message:"There is no user with this email."});
    }

    ResetPass.findOne({userId:user._id},function(err, reset){
      if(reset)
        reset.remove();

      var resetpass = new ResetPass({
        userId:user._id,
        resetCode: randtoken.generate(options.tokenLength)
      });

      resetpass.save(function(err,reset){
        if(err){
          res.status(404).json({error:err});
          return;
        }

        sendResetPassEmail(user.email, reset.resetCode, function(err, info){
          if(err){
            res.status(404).json({error:err});
            return;
          }

          res.send();
        });
      });
    });

  });
}

// POST method except { code: <reset code got by email>, password: <new password> }
module.exports.resetPassword = function(req,res){
  if(!req.body.token){
    return res.status(404).json({token:"required", message:"Reset token is required. "});
  }
  if(!req.body.password){
    return res.status(404).json({password:"required", message:"Password is required. "});
  }
  // TODO Politika passworda

  // Check for is there reset code
  ResetPass.findOne({resetCode:req.body.token}, function(err, reset){
    if(err){
      return res.status(404).json({error:err});
    }

    // there is no reset code, probably used earlier
    if(!reset){
      return res.status(404).json({code:"used or not valid", message:"Reset code is already used or invalid."});
    }

    // check token expiration
    var options = config.resetPassword;

    var duration = moment.duration(moment().diff(moment(reset.createdAt))).seconds();
    console.log(duration);

    if(duration >= options.expirationTime){
      return res.status(404).json({
        token:'expired',
        message:"Reset token expired."
      });
    }
    // find user and change password
    User.findOne({_id:reset.userId}, function(err, user){
      if(err){
        return res.status(404).json({error:err});
      }
      console.log(user);
      // can not find user, probably deleted
      if(!user){
        return res.status(404).json({})
      }

      // hash password
      user.password = passHash.generate(req.body.password);

      user.save(function(err, user){
        if(err){
          return res.status(404).json({error:err});
        }

        res.json({message:"Password reseted successfully."});
        // remove reset code
        reset.remove();
      });
    });
  }) // ResetPass.findOne END
} // .resetPassword END
