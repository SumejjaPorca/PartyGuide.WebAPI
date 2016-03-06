var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  barId:[Schema.Types.ObjectId],
  title:String,
  author:{
    username: String,
    _userId: Schema.Types.ObjectId,
    adminOf: [[Schema.Types.ObjectId]]
  },
  text: String,
  dateCreated: Date,
  date: Date
});

module.exports = mongoose.model('post', postSchema);
