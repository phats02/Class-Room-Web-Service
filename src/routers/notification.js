const express = require('express');
const authenticate = require('../authenticate');
const notificationController = require('../controllers/NotificationController');
const router = express.Router();

router.get(
  '/',
  authenticate.verifyUser,
  notificationController.getAllNotification
);
router.get(
  '/unview',
  authenticate.verifyUser,
  notificationController.getUnviewNotification
);
router.post(
  '/:notificationId/viewed',
  authenticate.verifyUser,
  notificationController.setViewedNotification
);

module.exports = router;
