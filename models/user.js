var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailRgx = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

var UserSchema = new Schema({
  username: {
    type:String,
    required:true,
    minlength:6
  },
  email:{
    type:String,
    match: emailRgx,
    required:true
  },
  password:{
    type:String,
    required:true,
    // We don't want to fetch user's password
    //select:false
  },
  adminOf:[Schema.Types.ObjectId],
  superadmin: Boolean,
  emailConfirmed: Boolean,
  banned:Boolean
});


UserSchema.index({username: 1}, {unique:true});
UserSchema.index({email: 1}, {unique:true});

module.exports = mongoose.model('user', UserSchema);
