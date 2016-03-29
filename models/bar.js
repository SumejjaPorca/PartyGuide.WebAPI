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
    match:phoneRgx
  },
  tags: [String],
  description:String
});

module.exports = mongoose.model('bar', BarSchema);
