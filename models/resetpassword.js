var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResetPassSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    required:true
  },
  resetCode:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    required:true,
    default:Date.now
  }
});

module.exports = mongoose.model('resetpassword', ResetPassSchema);
