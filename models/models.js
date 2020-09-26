const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const threadSchema = new Schema({
  _id: Schema.Types.ObjectId,
  board: {type: String},
  text: {type: String},
  created_on: {type: Date},
  bumped_on: {type: Date},
  reported: {type: Boolean, default: false},
  password: {type: String},
  replies: [{ type: Schema.Types.ObjectId, ref: 'Reply'}],
  replycount: {type: Number, default: 0}
});

const replySchema = new Schema({
  created_on: {type: Date},
  text: {type: String},
  password: {type: String},
  reported: {type: Boolean, default: false},
  thread_id: { type: Schema.Types.ObjectId, ref: 'Thread'},
});

const Thread = mongoose.model('Thread', threadSchema);
const Reply = mongoose.model('Reply', replySchema);

module.exports = {
  Thread,
  Reply
}