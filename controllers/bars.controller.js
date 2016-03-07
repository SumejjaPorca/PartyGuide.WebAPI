var express    = require('express');
var Bar = require('../models/bar')

var BarCtrl = express.Router()

BarCtrl.get('/',function(req, res){
  Bar.find(function(err, bars){
    if (err) return res.json(err);

    res.json(bars);
  });
});

BarCtrl.get('/:id', function(req, res){
  Bar.findOne({_id:req.params.id}).then(function(bar){
    if (!bar) return res.status(404).json({message:"There is no bar with this id."});

    res.json(bar);
  }, function(err){
    return res.status(501).json(err);
  });
});

module.exports = BarCtrl
