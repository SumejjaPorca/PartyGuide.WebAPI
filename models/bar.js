var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var phoneRgx = /^\+\d{8,13}$/i;

var BarSchema = new Schema({
  name:{
    type:String,
    required:true
  },
  location:{
    address:String,
    geo:[Number] //[<longitude>,<latitude>]
  },
  phone:{
    type:String,
    match:[phoneRgx, "Wrong phone number format."]
  },
  tags: [String],
  description:String
});

// we need to ensureIndex so we can search with nearSphere

BarSchema.index({'location.geo':"2dsphere"});
module.exports = mongoose.model('bar', BarSchema);
