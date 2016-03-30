var express    = require('express');
var mongoose = require('mongoose');
var Bar = mongoose.model('bar'); // Bar model
var User = mongoose.model('user');
var authProvider = require('../providers/auth');

// Our controller is router which we will exports
var BarCtrl = express.Router()

// Get all bars
BarCtrl.get('/',function(req, res){
  Bar.find(function(err, bars){
    if (err) return res.json(err);

    res.json(bars);
  });
});

// Get all bars by name
BarCtrl.get('/byName/:name',function(req, res){

  Bar.find({name: new RegExp(req.params.name,'i') }).then(function(bars){
    return res.status(200).json(bars);
  }, function(err){
    return res.status(501).json(err);
  });
});

//Get all bars that have tag in tags from the request
BarCtrl.post('/byTags',function(req, res){
  Bar.find({tags: {$in: req.body.tags}}).then(function(bars){
    return res.status(200).json(bars);
  }, function(err){
    return res.status(501).json(err);
  });
});

//Get all bars that near the location from the request
BarCtrl.get('/near',function(req, res){
  Bar.find({
    'location.geo': {
      $nearSphere: {
          $geometry:{
            type:"point",
            coordinates:[+req.query.lat, +req.query.long]
          },
          $minDistance:0,
          $maxDistance:5000
      }
    }
  }).limit(20).then(function(bars){
    return res.status(200).json(bars);
  }, function(err){
    return res.status(501).json(err);
  });
});


// Get bar by id, 404 if bar doesn't exist
BarCtrl.get('/:id', function(req, res){
  Bar.findOne({_id:req.params.id}).then(function(bar){
    if (!bar) return res.status(404).json({message:"There is no bar with this id."});
    return res.status(200).json(bar);
  }, function(err){
    return res.status(501).json(err);
  });
});

// Create new bar, 404 if new bar have validation errors
authProvider.authorize(BarCtrl, 'post', '/', function (req, res){
  // Only user can
  if (!req.user.superadmin){
    res.status(401).json({
      success:false,
      notSuperadmin:true,
      message:"You must be superadmin to perform this action."
    });
  }

  var bar = new Bar(req.body);
  bar.save().then(function(newBar){
    res.json(newBar)
  }, function(err){
    res.status(404).json(err);
  });
});

// Delete bar
authProvider.authorize(BarCtrl, 'delete', '/:id', function(req, res){
  // user must be superadmin to delete bar
  if (!req.user.superadmin){
    return res.status(401).json({
      success:false,
      notSuperadmin:true,
      message:"You must be superadmin to perform this action."
    });
  }

  // find bar with this id
  Bar.findOne({_id:req.params.id}).then(function(bar){
    if (!bar) return res.status(404).json({
      success:false,
      message:"There is no bar with this id."
    });
    // remove bar
    bar.remove(function(err){
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

// Edit bars information: name, description, tags, location and phone
authProvider.authorize(BarCtrl, 'put', '/:id', function(req, res){
  // find bar with this ID
  Bar.findOne({_id:req.params.id}).then(function(bar){
    if (!bar) return res.status(404).json({
      success:false,
      message:"There is no bar with this id."
    });

    // change bar
    bar.name = req.body.name;
    bar.description = req.body.description;
    bar.location = req.body.location;
    bar.phone = req.body.phone;
    bar.tags = req.body.tags;

    bar.save(function(err){
      if(err) return res.status(400).json(err);

      res.status(200).json();
    });
  }, function(err){
    // database error
    throw err;
  });
});

// Get all bar admins
authProvider.authorize(BarCtrl, 'get', '/:id/admins', function(req,res){
  var barId = req.params.id;
  User.find({adminOf:barId}).select("id username").then(function(users){
    res.status(200).json(users);
  }, function(err){
    // database error
    throw err;
  });
});

// Change all bars admins
authProvider.authorize(BarCtrl, 'put', '/:id/admins', function(req,res){
  // only superadmin can change adins
  if (!req.user.superadmin){
    res.status(401).json({
      success:false,
      notSuperadmin:true,
      message:"You must be superadmin to perform this action."
    });
  }

  var barId = req.params.id;
  User.find({adminOf:barId}).select("_id").then(function(users){
    var oldUsers = users.map(function(item){return item.id;});
    var newUsers = req.body;

    // find users that we need to add to admins
    var toAdd = [];
    newUsers.forEach(function(user){
      if(typeof user !== "string"){
        res.status(400).json({
          message: "All elements of array must be strings"
        });
      }
      if(oldUsers.indexOf(user)<0){
        toAdd.push(user);
        console.log("To add:" + user);
      }
    });

    // find users that we need to remove from admins
    var toRemove = [];
    oldUsers.forEach(function(user){
      if(newUsers.indexOf(user)<0){
        toRemove.push(user);

        console.log("To remove:" + user);
      }
    });

    // Add newIds
    User.update({ _id:{ $in:toAdd } },
      { $addToSet:{ adminOf:barId } },
      { multi:true }, function(err){

      if(err) throw err;
      // succesfully added new admins

      User.update({ _id:{ $in:toRemove } },
        { $pull:{ adminOf:barId } },
        { multi:true }, function(err){

        if (err) throw err;

        res.status(200).json();

      });

    });


  }, function(err){
    // database
    throw err;
  });
});

module.exports = BarCtrl
