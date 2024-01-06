var express = require("express");
var router = express.Router();
const authController = require("../controllers/AuthController");
const authenticate = require("../authenticate");

router.post("/login", authController.postLogin);
router.post("/register", authController.postRegister);
router.get(
  "/google/token",
  authenticate.verifyGoogle,
  authController.socialLogin
);
router.get(
  "/facebook/token",
  authenticate.verifyFacebook,
  authController.socialLogin
);
router.post("/forgot-password", authController.postForgotPassword);
router.get(
  "/forgot-password/:forgotPasswordCode",
  authController.getCheckForgotPasswordCode
);
router.post(
  "/forgot-password/:forgotPasswordCode",
  authController.resetPassword
);
router.get("/activation/:activationCode", authController.activation);

router.post("/admin/login", authController.postAdminLogin);

module.exports = router;
