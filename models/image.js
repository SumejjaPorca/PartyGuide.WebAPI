var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var schema = new Schema({
  name:{
    type:String,
    required:true
  },
  used:{
    type:Boolean,
    default:false
  },
  data:Buffer,
  contentType:String,
  created:{
    type:Date,
    default:Date.now
  }
});


module.exports = mongoose.model('image', schema);
