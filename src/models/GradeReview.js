const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GradeReview = new Schema(
  {
    studentId: String,
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    expectedGrade: Number,
    actualGrade: Number,
    message: String,
    status: {
      type: Number,
      default: 0,
    }, // 0: pending, 1: approved, 2: rejected
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('GradeReview', GradeReview);
