var express    = require('express');
var mongoose = require('mongoose');
var Post = require('../models/Post') // Post model
var Bar = mongoose.model('Bar'); // Bar model

// controller will be exported and used as Router
var PostCtrl = express.Router()

// Get all by barId
PostCtrl.get('/bars/:barId/posts',function(req, res){
  //check if bar with specified id exists
  //if not, return 'Bad Request'
  Bar.findOne({_id:req.params.barId}).then(function(data){
      if (!data) return res.status(400).json({message:"There is no bar with this id."});
      else {
        Post.find(
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

// Get post by id, 404 if post with that id doesn't exist
PostCtrl.get('/posts/:id', function(req, res){
  Post.findOne({_id:req.params.id}).then(function(data){
    if (!data) return res.status(404).json({message:"There is no post written with this id."});
    res.json(data);
  }, function(err){
    return res.status(500).json(err);
  });
});

// Create new post, 404 if new req body has validation errors
//TODO: required method
PostCtrl.post('/posts', function (req, res){
  //Check if bar with id provided in body of req exists
  //if not, return bad request
  Bar.findOne({_id:req.params.barId}).then(function(data){
      if (!data) return res.status(400).json({message:"There is no bar with this id."});
      else{
        var post = new Post(req.body);
        Post.save().then(function(newPost){
          res.status(201).json(newPost)
        }, function(err){
          res.status(500).json(err);
        });
      }
  });
});

module.exports = PostCtrl
