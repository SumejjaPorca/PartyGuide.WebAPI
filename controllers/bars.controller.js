var express    = require('express');
var mongoose = require('mongoose');
var Bar = mongoose.model('bar') // Bar model

// Our controller is router which we will exports
var BarCtrl = express.Router()

// Get all bars
BarCtrl.get('/',function(req, res){
  Bar.find(function(err, bars){
    if (err) return res.json(err);

    res.json(bars);
  });
});

// Create new bar, 404 if new bar have validation errors
BarCtrl.post('/', function (req, res){
  // TODO: Check if user is superadmin
  var bar = new Bar(req.body);
  bar.save().then(function(newBar){
    res.json(newBar)
  }, function(err){
    res.status(404).json(err);
  });
});


// Get bar by id, 404 if bar doesn't exist
BarCtrl.get('/:id', function(req, res){
  Bar.findOne({_id:req.params.id}).then(function(bar){
    if (!bar) return res.status(404).json({message:"There is no bar with this id."});


  }, function(err){
    return res.status(501).json(err);
  });
});

BarCtrl.delete('/:id', function(req, res){
  console.log('delete')
  Bar.findOne({_id:req.params.id}).then(function(bar){
    if (!bar) return res.status(404).json({message:"There is no bar with this id."});

    bar.remove(function(err){
      if (err) return res.status(400).json({message:err});

      res.status(200).json({status:"removed"});
    });

  }, function(err){
    return res.status(501).json(err);
  });
});

module.exports = BarCtrl
