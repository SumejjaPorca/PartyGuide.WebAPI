var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BarSchema = new Schema({
  name:{
    type:String,
    required:true
  },
  location:{
    address:String,
    geo:[Number] //[<longitude>,<latitude>]
  },
  description:String
});

module.exports = mongoose.model('bar', BarSchema);
