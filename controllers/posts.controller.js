var express    = require('express');
var Post = require('../models/Post') // Post model

// controller will be exported and used as Router
var PostCtrl = express.Router()

// Get all
//TODO: get all by barId
//TODO: Check if bar with provided id exists
PostCtrl.get('/',function(req, res){
  Post.find(function(err, data){
    if (err) return res.json(err);

    res.json(data);
  });
});

// Get post by id, 404 if post with that id doesn't exist
PostCtrl.get('/:id', function(req, res){
  Post.findOne({_id:req.params.id}).then(function(data){
    if (!data) return res.status(404).json({message:"There is no post written with this id."});
    res.json(data);
  }, function(err){
    return res.status(501).json(err);
  });
});

// Create new post, 404 if new req body has validation errors
PostCtrl.post('/', function (req, res){
  //TODO: Check if bar with id provided in body of req exists
  //TODO: Check if user is admin of the bar with provided id
  var post = new Post(req.body);
  Post.save().then(function(newPost){
    res.json(newPost)
  }, function(err){
    res.status(404).json(err);
  });
});

module.exports = PostCtrl
