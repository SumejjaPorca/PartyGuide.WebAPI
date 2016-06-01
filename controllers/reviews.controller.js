var express    = require('express');
var mongoose = require('mongoose');
var Review = mongoose.model('review'); // Review model
var Bar = mongoose.model('bar'); // Bar model
var authProvider = require('../providers/auth') //auth provider to authorize methods

// controller will be exported and used as Router
var ReviewCtrl = express.Router();

ReviewCtrl.get('/reviews/statistics', function(req, res){
  Review.count(function(err, c) {
          if(err)
            res.status(400).json(err);
          else
           return res.status(200).json({
             count: c
           });
      });
});



// Get all by barId
ReviewCtrl.get('/bars/:barId/reviews',function(req, res){
  //check if bar with specified id exists
  //if not, return 'Bad Request'
  Bar.findOne({_id:req.params.barId}).then(function(data){
      if (!data) return res.status(400).json({message:"There is no bar with this id."});
      else {
        Review.find(
          {
            barId: req.params.barId
          },
          function(err, data){
            if (err) return res.json(err);
            res.json(data);
          });
        }
    });
});

// Create new review
//400 if new req body has validation errors or bad parameters
 authProvider.authorize(ReviewCtrl, 'post', '/reviews', function (req, res){
  //check if user is logged in
  if (!req.user){
    return res.status(401).json({
      success:false,
      message:"You must be logged in to perform this action."
    });
  }
  //Check if bar with id provided in body of req exists
  //if not, return bad request
  Bar.findOne({_id:req.body.barId}).then(function(data){
      if (!data) return res.status(400).json({message:"There is no bar with this id."});
      else{
        //TO DO: check if adding with subschema like this is possible
        var review = new Review(req.body);
        review.user = {
          username:req.user.username,
          id:req.user.id
        };

        review.save().then(function(newReview){
          res.status(201).json(newReview)
        }, function(err){
          res.status(500).json(err);
        });
      }
  });
});

//Delete review
authProvider.authorize(ReviewCtrl, 'delete', '/reviews/:id', function(req, res){
  // user must be author of the review to delete it
  /*if (!req.user){
    return res.status(401).json({
      success:false,
      message:"You must be logged in to perform this action."
    });
  }*/

  console.log("ovjde1");
  // find review with this id
  Review.findOne({_id:req.params.id}).then(function(review){

    console.log("ovjde2");
    if (!review) return res.status(404).json({
      success:false,
      message:"There is no review with this id."
    });
    //check if user is the author of the review
    if(review.user.id != req.user.id)
    {
      return res.status(401).json({
        success:false,
        message:"You must be author of this review to perform this action."
      });
    }
    // remove review
    review.remove(function(err){
      if (err) return res.status(400).json({
        success:false,
        message:err
      });

      res.status(200).json({
        success:true,
        removed:true
      });

    });

  }, function(err){
    // database error
    throw err;
  });
});

module.exports = ReviewCtrl;
