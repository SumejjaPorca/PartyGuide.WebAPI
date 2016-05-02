var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfirmEmailSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    required:true
  },
  confirmToken:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    required:true,
    default:Date.now
  }
});

module.exports = mongoose.model('confirmemail', ConfirmEmailSchema);
