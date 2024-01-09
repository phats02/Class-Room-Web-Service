const Course = require("../models/Course");

module.exports = {
  getCourseBySlug: async (req, res, next) => {
    const { slug } = req.params;
    const course = await Course.findOne({ slug });
    if (!course) {
      return res.json({
        code: 404,
        success: false,
        message: "Course not found",
      });
    }
    req.course = course;
    next();
  },

  getCourseById: async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.json({
        code: 404,
        success: false,
        message: "Course not found",
      });
    }
    req.course = course;
    next();
  },

  requireTeacher: (req, res, next) => {
    const course = req.course;
    if (!course.teachers.toString().includes(req.user._id)) {
      return res.json({
        code: 403,
        success: false,
        message: "Forbidden",
      });
    }
    req.isTeacher = true;
    next();
  },

  requireStudentOrTeacher: (req, res, next) => {
    const course = req.course;
    if (
      !course.students.toString().includes(req.user._id) &&
      !course.teachers.toString().includes(req.user._id)
    ) {
      return res.json({
        code: 403,
        success: false,
        message: "Forbidden",
      });
    }
    if (course.teachers.toString().includes(req.user._id)) {
      req.isTeacher = true;
    }
    if (course.studentIds.toString().includes(req.user.student)) {
      req.isMapped = true;
    }
    next();
  },

  requireStudent: (req, res, next) => {
    const course = req.course;
    if (!course.students.toString().includes(req.user._id)) {
      return res.json({
        code: 403,
        success: false,
        message: "Forbidden",
      });
    }
    next();
  },
};
