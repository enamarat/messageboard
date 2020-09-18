const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const threadSchema = new Schema({
  board: {type: String},
  text: {type: String},
  created_on: {type: Date},
  bumped_on: {type: Date},
  reported: {type: Boolean, default: false},
  password: {type: String},
  replies: [],
  replycount: {type: Number, default: 0}
});

const Thread = mongoose.model('Thread', threadSchema);

const replySchema = new Schema({
  created_on: {type: Date},
  text: {type: String},
  password: {type: String},
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread'
  },
});

const Reply = mongoose.model('Reply', replySchema);
  
module.exports = {
  Thread,
  Reply
}