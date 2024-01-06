const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Assignment = new Schema(
  {
    name: {
      type: String,
    },
    point: {
      type: Number,
    },
    grades: [
      {
        id: { type: String },
        grade: { type: Number },
        draft: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', Assignment);
