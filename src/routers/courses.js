const authenticate = require("../authenticate");
const courseMiddleware = require("../middlewares/courses");
const adminMiddleWare = require("../middlewares/requireAdmin.mdw");
const express = require("express");
const courseController = require("../controllers/CourseController");

const router = express.Router();

router.get(
  "/all",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  courseController.getAllCourses
);
router.get(
  "/all/:id",
  authenticate.verifyUser,
  adminMiddleWare.requiredAdmin,
  courseController.getAnyCourseById
);

router
  .post("/store", authenticate.verifyUser, courseController.createCourse)
  .get("/:slug", authenticate.verifyUser, courseController.getCourse)
  .put("/:id", authenticate.verifyUser, courseController.updateCourse)
  .delete("/:id", authenticate.verifyUser, courseController.deleteCourse)
  .get("/", authenticate.verifyUser, courseController.getCourses);

router.get("/join/:id", authenticate.verifyUser, courseController.joinCourse);

router
  .route("/invite")
  .post(authenticate.verifyUser, courseController.inviteUser);
router.get(
  "/:id/invitation",
  authenticate.verifyUser,
  courseController.getDefaultInvitation
);

/**
 * type body = {
 *  type: '0' | '1';
 *  userId: string
 * }
 */
router.post(
  "/:id/invitation",
  authenticate.verifyUser,
  courseController.createInvitation
);

router
  .get(
    "/:slug/assignment",
    authenticate.verifyUser,
    courseController.getAllAssignment
  )
  .post(
    "/:slug/assignment",
    authenticate.verifyUser,
    courseController.addAssignment
  );

router
  .get(
    "/:slug/assignment/:id",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireStudentOrTeacher,
    ],
    courseController.getAssignments
  )
  .patch(
    "/:slug/assignment/:id",
    authenticate.verifyUser,
    courseController.updateAssignment
  )
  .delete(
    "/:slug/assignment/:id",
    authenticate.verifyUser,
    courseController.deleteAssignment
  );

router
  .post(
    "/:slug/assignment/:id/review",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireStudent,
    ],
    courseController.submitGradeReview
  )
  .get(
    "/:slug/assignment/:id/review",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireStudentOrTeacher,
    ],
    courseController.getGradeReviews
  );

router
  .get(
    "/:slug/assignment/:id/review/:reviewId",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireStudentOrTeacher,
    ],
    courseController.getSingleReview
  )
  .delete(
    "/:slug/assignment/:id/review/:reviewId",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireStudentOrTeacher,
    ],
    courseController.deleteSingleReview
  );

router.post(
  "/:slug/assignment/:id/review/:reviewId/comment",
  [
    authenticate.verifyUser,
    courseMiddleware.getCourseBySlug,
    courseMiddleware.requireStudentOrTeacher,
  ],
  courseController.reviewAddComment
);

router.post(
  "/:slug/assignment/:id/review/:reviewId/finalize",
  [
    authenticate.verifyUser,
    courseMiddleware.getCourseBySlug,
    courseMiddleware.requireTeacher,
  ],
  courseController.markFinalReview
);

router
  .get(
    "/:slug/assignment/:id/grade",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireTeacher,
    ],
    courseController.getSingleStudentGrade
  )
  .post(
    "/:slug/assignment/:id/grade",
    [
      authenticate.verifyUser,
      courseMiddleware.getCourseBySlug,
      courseMiddleware.requireTeacher,
    ],
    courseController.setSingleStudentGrade
  );

router.post(
  "/:slug/assignment/:id/upload",
  [
    authenticate.verifyUser,
    courseMiddleware.getCourseBySlug,
    courseMiddleware.requireTeacher,
  ],
  courseController.setMultipleStudentGrades
);

router.post(
  "/:slug/assignment/:id/finalize",
  [
    authenticate.verifyUser,
    courseMiddleware.getCourseBySlug,
    courseMiddleware.requireTeacher,
  ],
  courseController.setSingleGradeFinalize
);

router.post(
  "/:slug/assignment/:id/finalizemultiple",
  [
    authenticate.verifyUser,
    courseMiddleware.getCourseBySlug,
    courseMiddleware.requireTeacher,
  ],
  courseController.setMultipleGradeFinalize
);

router.post(
  "/:slug/assignment/studentid",
  [
    authenticate.verifyUser,
    courseMiddleware.getCourseBySlug,
    courseMiddleware.requireTeacher,
  ],
  courseController.setCourseStudentIds
);

module.exports = router;
