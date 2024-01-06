const Notification = require('../models/Notification');

module.exports = {
  async getAllNotification(req, res) {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('sender')
      .populate('course');
    const filterNotification = notifications.map((notification) => {
      const {
        _id,
        userId,
        sender,
        message,
        course,
        additional,
        viewed,
        createdAt,
      } = notification;
      return {
        _id,
        userId,
        sender: sender.name,
        message,
        viewed,
        createdAt,
        course: course.name,
        additional,
      };
    });
    return res.json({
      success: true,
      statusCode: 200,
      message: 'Get all notifications successfully',
      filterNotification,
    });
  },

  setViewedNotification(req, res) {
    const { notificationId } = req.params;
    Notification.findOneAndUpdate(
      { _id: notificationId },
      { viewed: true },
      (err, notification) => {
        if (err) {
          return res.json({
            success: false,
            statusCode: 400,
            message: 'Something went wrong',
          });
        }
        return res.json({
          success: true,
          statusCode: 200,
          message: 'Set viewed notification successfully',
          notification,
        });
      }
    );
  },

  async getUnviewNotification(req, res) {
    const notifications = await Notification.find({
      userId: req.user._id,
      viewed: false,
    })
      .populate('sender')
      .populate('course');
    const filterNotification = notifications.map((notification) => {
      const {
        _id,
        userId,
        sender,
        message,
        course,
        additional,
        viewed,
        createdAt,
      } = notification;
      return {
        _id,
        userId,
        sender: sender.name,
        message,
        viewed,
        createdAt,
        course: course.name,
        additional,
      };
    });
    return res.json({
      success: true,
      statusCode: 200,
      message: 'Get unviewed notifications successfully',
      filterNotification,
    });
  },
};
