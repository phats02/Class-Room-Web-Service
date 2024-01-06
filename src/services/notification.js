const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const socket = require('../socket');

module.exports = {
  gradeFinalizeNotification: async (
    courseId,
    assignment,
    studentId,
    senderId
  ) => {
    const user = await User.findOne({ student: studentId });
    if (!user) return;
    const newNotification = new Notification({
      userId: user._id,
      sender: senderId,
      type: 'GRADE_FINALIZE',
      message: `${assignment.name} đã có điểm`,
      course: courseId,
      additional: assignment._id,
    });
    await newNotification.save();
    socket.sendNotice(user._id, newNotification);
  },

  newCommentNotification: async (
    courseId,
    receiverId,
    senderId,
    senderName,
    assignment
  ) => {
    const newNotification = new Notification({
      userId: receiverId,
      sender: senderId,
      type: 'NEW_COMMENT',
      message: `${senderName} đã bình luận về ${assignment.name}`,
      course: courseId,
    });
    await newNotification.save();
    socket.sendNotice(receiverId, newNotification);
  },

  markReviewNotification: async (
    courseId,
    receiverId,
    senderId,
    senderName,
    assignment,
    approved
  ) => {
    const newNotification = new Notification({
      userId: receiverId,
      sender: senderId,
      type: 'MARK_REVIEW',
      message: `${senderName} đã ${approved ? 'đánh giá' : 'bỏ đánh giá'} ${
        assignment.name
      }`,
      course: courseId,
    });
    await newNotification.save();
    socket.sendNotice(receiverId, newNotification);
  },

  newGradeReviewNotification: async (
    course,
    senderId,
    senderName,
    assignment
  ) => {
    if (!course) return;
    const notifyAll = course.teachers.map((teacher) => {
      const teacherId = teacher.toString();
      console.log('teacher: ', teacherId);
      const newNotification = new Notification({
        userId: teacherId,
        sender: senderId,
        type: 'NEW_GRADE_REVIEW',
        message: `${senderName} đã yêu cầu đánh giá ${assignment.name}`,
        course: course._id,
      });
      socket.sendNotice(teacherId, newNotification);
      return newNotification.save();
    });
    await Promise.all(notifyAll);
  },
};
