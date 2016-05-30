var express    = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var Image = mongoose.model('image');
var randtoken = require('rand-token');
var authProvider = require('../providers/auth');

// Our controller is router which we will exports
var ImageCtrl = express.Router()

// Get all bars
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

ImageCtrl.get('/:name',function(req,res){
  Image.findOne({name:req.params.name}).then(function(img){
    if(!img){
      return res.status(404).send();
    }
    res.writeHead('200', {'content-type':img.contentType})
    res.end(img.data,'binary');

  }).catch(function(err){
    console.log(err);
    res.status(500).send();
  })
});

ImageCtrl.post('/upload', upload.single('image'), function(req, res){
  console.log(JSON.stringify(req.body));
  var img = new Image();

  img.name = randtoken.generate(48);
  img.data = req.file.buffer;
  img.contentType = req.file.mimetype;

  img.save().then(function(img){
    res.json({name:img.name});
  }).catch(function(err){
    console.log(err);
    res.status(500).send();
  });

});


module.exports = ImageCtrl
