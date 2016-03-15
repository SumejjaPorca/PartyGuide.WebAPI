var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Author = new Schema({
  username: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

var PostSchema = new Schema({
  barId:{
    type: Schema.Types.ObjectId,
    required: true
  },
  title:{
    type: String,
    required: true,
    max: 100
  },
  author:{
    type: Author,
    required: true
  },
  text: {
    type: String,
    max: 1000
  },
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  date: Date
});

module.exports = mongoose.model('post', postSchema);
