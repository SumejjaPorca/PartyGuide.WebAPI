var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
  // There shouldn't be
  barId:{
    type:Schema.Types.ObjectId,
    required:true
  },
  userId:{
    type:Schema.Types.ObjectId,
    required:true
  },
  rate:{ //
    type:Number,
    required:true
  },
  comment:String,
  created:{
    type:Date,
    default: Date.now
  }
});

ReviewSchema.index({barId: 1, userId: 1}, {unique:true})

module.exports = mongoose.model('review', ReviewSchema);
