var express    = require('express');
var mongoose = require('mongoose');
var Review = mongoose.model('bar'); // Review model
var Bar = mongoose.model('bar'); // Bar model
var authProvider = require('../providers/auth') //auth provider to authorize methods

// controller will be exported and used as Router
var ReviewCtrl = express.Router();

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
  Bar.findOne({_id:req.params.barId}).then(function(data){
      if (!data) return res.status(400).json({message:"There is no bar with this id."});
      else{
        //TO DO: check if adding with subschema like this is possible
        var review = new Review(req.body);
        Review.save(review).then(function(newReview){
          res.status(201).json(newReview)
        }, function(err){
          res.status(500).json(err);
        });
      }
  });
});

module.exports = ReviewCtrl;
