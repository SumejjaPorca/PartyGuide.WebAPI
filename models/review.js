var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});


var ReviewSchema = new Schema({
  barId:{
    type:Schema.Types.ObjectId,
    required:true
  },
  user:{
    type: UserSchema
    required:true
  },
  rate:{ 
    type:Number,
    min:1.
    max:5,
    required:true
  },
  dateCreated:{
    type:Date,
    default: Date.now
  },
  comment:String
});

ReviewSchema.index({barId: 1, "user.id": 1}, {unique:true})

module.exports = mongoose.model('review', ReviewSchema);
