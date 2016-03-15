var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailRgx = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

var UserSchema = new Schema({
  username: {
    type:String,
    required:true
  },
  email:{
    type:String,
    match: emailRgx,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  adminOf:[Schema.Types.ObjectId],
  superadmin: Boolean
});

module.exports = mongoose.model('user', UserSchema);
