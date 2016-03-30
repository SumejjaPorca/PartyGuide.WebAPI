var express    = require('express');
var mongoose = require('mongoose');
var Bar = mongoose.model('bar') // Bar model
var authProvider = require('../providers/auth')

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
BarCtrl.get('/:name',function(req, res){
  Bar.find({name:req.params.name}).then(function(bars){
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


authProvider.authorize(BarCtrl, 'delete', '/:id', function(req, res){
  // user must be superadmin to delete bar
  if (!req.user.superadmin){
    res.status(401).json({
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

module.exports = BarCtrl
