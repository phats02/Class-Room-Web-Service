const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: String,
    message: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    viewed: { type: Boolean, default: false },
    additional: Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', Notification);
