var express    = require('express');
var mongoose = require('mongoose');
var Post = mongoose.model('post') // Post model
var Bar = mongoose.model('bar'); // Bar model
var authProvider = require('../providers/auth') //auth provider to authorize methods

// controller will be exported and used as Router
var PostCtrl = express.Router()

PostCtrl.get('/posts/statistics', function(req, res){
  var week = getWeek(),
      response = {};
      response.dates = week;
      var last = new Date(week[6]);
      last.setHours(24);
      response.counts = [0,0,0,0,0,0,0];
      if(req.params.events != undefined){
        Post.find({dateCreated: {$gt:week[0], $lt: last}, date: { $exists: true }}, function(err, data){
          if(err)
            return res.status(400).json(err);
          data.forEach(function(item){
            week.forEach(function(item2, index){
              if(SameDay(item2, item.dateCreated))
               response.counts[index]++;
              });
            });
          return res.json(response);
        });
      }
      else{
        Post.find({dateCreated: {$gt:week[0], $lt: last}}, function(err, data){
          if(err)
            return res.status(400).json(err);
          data.forEach(function(item){
            week.forEach(function(item2, index){
              if(SameDay(item2, item.dateCreated))
               response.counts[index]++;
              });
            });
          return res.json(response);
        });
      }

});

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
          }).sort({dateCreated:-1}).exec(function(err, data){
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

// Create new post
//400 if new req body has validation errors or bad parameters
 authProvider.authorize(PostCtrl, 'post', '/posts', function (req, res){
  //check if user is logged in
  if (!req.user){
    return res.status(401).json({
      success:false,
      message:"You must be logged in to perform this action."
    });
  }
  //Check if bar with id provided in body of req exists
  //if not, return bad request
  console.log(JSON.stringify(req.user));
  Bar.findOne({_id:req.body.barId}).then(function(data){
      if (!data) return res.status(400).json({message:"There is no bar with this id."});
      else{
       //401 if user not logged in or user not admin of the bar
        var adminOf = req.user.adminOf.map(function(x){return x.toString()});
        console.log(JSON.stringify(adminOf));
        console.log(typeof adminOf[0])
        if(adminOf.indexOf(req.body.barId) <= -1 ){
          return res.status(401).json({
            success:false,
            message:"You must be admin of the bar to perform this action."
          });
        }
        //user is authorized to do this method
        //TO DO: check if adding with subschema like this is possible
        var post = new Post(req.body);
        post.author = {
          username:req.user.username,
          userId:req.user.id
        };
        post.save().then(function(newPost){
          res.status(201).json(newPost)
        }, function(err){
          res.status(500).json(err);
        });

      }
  });
});

function getWeek() {

  d = new Date();
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1);
      console.log(diff);
  var monday = new Date(d.setDate(diff));
  monday.setHours(0);
  monday.setMinutes(0);
  monday.setSeconds(0);
  console.log(monday);
  var week =  [monday, new Date(monday), new Date(monday), new Date(monday), new Date(monday),
  new Date(monday), new Date(monday)];
  week.forEach(function(item, index){
    item.setDate(diff + index);
    console.log(diff );
    console.log(index);
  });
  return week;
}

function SameDay(one, two){
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;

  // Round down.
  return Math.floor(days) < 1 && Math.floor(days) >= 0;
}

module.exports = PostCtrl
