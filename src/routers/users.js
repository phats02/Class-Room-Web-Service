var express = require("express");
var router = express.Router();
const userController = require("../controllers/UserController");
const authenticate = require("../authenticate");
const adminMiddleWare = require("../middlewares/requireAdmin.mdw");

router.get(
  "/student/:student",
  authenticate.verifyUser,
  userController.checkStudent
);

router.post(
  "/admins",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  userController.postCreateAdmin
);
router.get(
  "/admins",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  userController.getAdmins
);
router.post(
  "/ban",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  userController.postBan
);

//admin map studentId
router.patch(
  "/map",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  userController.mapStudentId
);
// admin unmap studentId
router.patch(
  "/unmap",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  userController.unmapStudentId
);

router.post(
  "/unlock",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  userController.postUnlock
);
router.put("/:id", authenticate.verifyUser, userController.update);
router.get("/:id", authenticate.verifyUser, userController.show);
router.get("/", authenticate.verifyUser, userController.index);

module.exports = router;
