var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DummySchema = new Schema({
  title:String,
  loc:{
    address:String,
    geo:[Number] //[<longitude>,<latitude>]
  },
  description:String
});

module.exports = mongoose.model('dummy', DummySchema);
