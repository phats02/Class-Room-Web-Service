const Course = require("../models/Course");
const nodemailer = require("nodemailer");
const { email, CLIENT_URL } = require("../config/mainConfig");
const Invitation = require("../models/Invitation.js");
const { nanoid } = require("nanoid");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const GradeReview = require("../models/GradeReview");
const notificationService = require("../services/notification");
const _ = require("lodash");

const createDefaultInvitation = (courseId) => {
  const newInvitation = new Invitation({
    courseId,
    inviteCode: nanoid(8),
    type: 1,
  });
  return newInvitation.save();
};

module.exports = {
  // notAllowMethod: (req, res, next) => {
  //   res.json({
  //     code: res.statusCode,
  //     status: false,
  //     message: "The method is not allowed",
  //   });
  // },

  // [GET] /courses
  getCourses: async (req, res, next) => {
    const courses = await Course.find({
      $or: [
        { students: req.user.id },
        { owner: req.user.id },
        { teachers: req.user.id },
      ],
    }).populate("owner");
    res.json({ code: res.statusCode, success: true, courses });
  },

  // [GET] /courses/all

  getAllCourses: async (req, res, next) => {
    const courses = await Course.find({}).populate("owner");
    res.json({ code: res.statusCode, success: true, courses });
  },

  getAnyCourseById: async (req, res, next) => {
    const course = await Course.findById(req.params.id)
      .populate("owner")
      .populate("teachers");
    res.json({ code: res.statusCode, success: true, course });
  },

  // [POST] /courses/store
  createCourse: async (req, res, next) => {
    const course = new Course({
      name: req.body.name,
      description: req.body.description,
      students: [],
      teachers: [req.user.id],
      owner: req.user.id,
      joinId: nanoid(8),
    });
    course
      .save()
      .then(async () => {
        await createDefaultInvitation(course._id);

        res.json({ code: res.statusCode, success: true, course });
      })
      .catch((err) => {
        res.json({
          code: res.statusCode,
          success: false,
          message: err.message,
        });
      });
  },

  // [GET] /courses/:slug
  getCourse: async (req, res, next) => {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("teachers")
      .populate("students")
      .populate("owner")
      .populate("assignments");

    if (course) {
      if (
        course.students.toString().includes(req.user.id) ||
        course.teachers.toString().includes(req.user.id) ||
        course.owner.id === req.user.id
      ) {
        res.json({ code: res.statusCode, success: true, course });
      } else {
        res.json({
          code: res.statusCode,
          success: false,
          message: "You are not allowed to access this course",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
    }
  },

  // [PUT] /courses/:id
  updateCourse: async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (course) {
      // check owner
      if (course.teachers.toString().includes(req.user._id)) {
        if (req.body.name) {
          course.name = req.body.name;
        }
        if (req.body.description) {
          course.description = req.body.description;
        }
        if (req.body.assignments) {
          course.assignments = req.body.assignments;
        }
        course
          .save()
          .then(() => {
            res.json({
              code: res.statusCode,
              success: true,
              message: "Course updated successfully",
            });
          })
          .catch((err) => {
            res.json({
              code: res.statusCode,
              success: false,
              message: err.message,
            });
          });
      } else {
        res.json({
          code: res.statusCode,
          success: false,
          message: "You are not allowed to modify this course",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
    }
  },

  // [DELETE] /courses/:id
  deleteCourse: async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (course) {
      if (course.owner === req.user.id) {
        course
          .remove()
          .then(() => {
            res.json({
              code: res.statusCode,
              success: true,
              message: "Course deleted successfully",
            });
          })
          .catch((err) => {
            res.json({
              code: res.statusCode,
              success: false,
              message: err.message,
            });
          });
      } else {
        res.json({
          code: res.statusCode,
          success: false,
          message: "You are not allowed to delete this course",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
    }
  },

  /** [POST] /courses/invite
   * req.body = {
   *  courseId: string,
   *  email: string,
   *  type: number,
   * }
   */
  inviteUser: async (req, res, next) => {
    const course = await Course.findById(req.body.courseId);
    const userEmail = req.body.email;
    const type = req.body.type;
    const teacherId = req.user._id;
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    if (!course.teachers.toString().includes(teacherId)) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Not authorized",
      });
      return;
    }
    const invitedUser = await User.findOne({ email: userEmail });
    if (!invitedUser) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "User with email not found",
      });
      return;
    }
    const invitation = new Invitation({
      courseId: course._id,
      inviteCode: nanoid(8),
      type: type === undefined ? 0 : type,
      userId: invitedUser._id,
    });
    try {
      invitation.save();
    } catch (err) {
      console.error(err);
      res.json({
        code: res.statusCode,
        success: false,
        message: "Cannot create invitation",
      });
      return;
    }
    const inviteLink = `${CLIENT_URL}/courses/join/${invitation.inviteCode}`;
    const message = type
      ? `<p>You are invited to a course on the coursepin system. Click on the link if you agree: <a href="${inviteLink}">Link</a></p>`
      : `<p>You are invited to be a teacher in a course on the coursepin system. Click on the link if you agree: <a href="${inviteLink}">Link</a></p>`;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: email.account, // generated ethereal user
        pass: email.password, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"CoursePin" <coursepincourseroom@gmail.com>', // sender address
      to: userEmail, // list of receivers
      subject: "Someone invited you to join course", // Subject line
      text: "Hello world", // plain text body
      html: message, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    res.json({
      code: res.statusCode,
      success: true,
      message: "Invite success!",
    });
  },

  getDefaultInvitation: async (req, res, next) => {
    const course = await Course.findOne({
      _id: req.params.id,
      teachers: req.user.id,
    });
    if (course) {
      const invitation = await Invitation.findOne({
        courseId: course._id,
        userId: null,
      });
      if (invitation) {
        res.json({ code: res.statusCode, success: true, invitation });
      } else {
        res.json({
          code: res.statusCode,
          success: false,
          message: "Invitation not found",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
    }
  },

  createInvitation: async (req, res) => {
    const { type, userId } = req.body;
    if (!type || (type !== "1" && type !== "0") || !userId) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Not enough inputs",
      });
      return;
    }
    const course = await Course.findOne({
      _id: req.params.id,
      teacher: req.user._id,
    });
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    const existInvitation = await Invitation.findOne({
      userId,
      type: Number.parseInt(type),
    });
    if (existInvitation) {
      await Invitation.deleteMany({ userId, type: Number.parseInt(type) });
    }
    const newInvitation = new Invitation({
      courseId,
      inviteCode: nanoid(8),
      userId,
      type: Number.parseInt(type),
    });
    try {
      await newInvitation.save();
      res.json({ code: res.statusCode, success: true, newInvitation });
    } catch (err) {
      console.error(err);
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  joinCourse: async (req, res, next) => {
    const userId = req.user._id;
    const invitation = await Invitation.findOne({ inviteCode: req.params.id });
    if (!invitation) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Invite not found",
      });
      return;
    }
    if (invitation.userId && invitation.userId !== userId.toString()) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    const course = await Course.findById(invitation.courseId);
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    if (invitation.type === 1) {
      if (course.teachers.includes(userId)) {
        res.json({
          code: res.statusCode,
          success: false,
          message: "Already a teacher",
        });
        return;
      }
      if (course.students && course.students.includes(userId)) {
        res.json({
          code: res.statusCode,
          success: false,
          message: "You have already joined this course",
        });
        return;
      }
      if (!course.students) {
        course.students = [];
      }
      course.students.push(userId);
    } else if (invitation.type === 0) {
      if (course.teachers && course.teachers.includes(userId)) {
        res.json({
          code: res.statusCode,
          success: false,
          message: "You have already joined this course",
        });
        return;
      }
      if (!course.teachers) {
        course.teachers = [];
      }
      course.teachers.push(userId);
    }
    try {
      await course.save();
      res.json({
        code: res.statusCode,
        success: true,
        message: "Course joined successfully",
        course: course,
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  getAllAssignment: async (req, res, next) => {
    const course = await Course.findOne({
      slug: req.params.slug,
    }).populate("assignments");
    if (course) {
      if (
        course.students.toString().includes(req.user.id) ||
        course.teachers.toString().includes(req.user.id) ||
        course.owner.id === req.user.id
      ) {
        if (course.students.toString().includes(req.user.id)) {
          course.assignments.forEach((assignment) => {
            assignment.grades = assignment.grades.filter((grade) => {
              if (grade.id === req.user.student && !grade.draft) {
                return true;
              }
            });
          });
        }
        res.json({
          code: res.statusCode,
          success: true,
          assignments: course.assignments,
        });
      } else {
        res.json({
          code: res.statusCode,
          success: false,
          message: "You are not allowed to access this course",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
    }
  },

  addAssignment: async (req, res, next) => {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    if (!course.teachers.toString().includes(req.user._id)) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    const { name, point } = req.body;
    const newAssignment = new Assignment({
      name,
      point,
    });
    try {
      await newAssignment.save();
      course.assignments.push(newAssignment._id);
      await course.save();
      res.json({
        code: res.statusCode,
        success: true,
        message: "Assignment added successfully",
        assignment: newAssignment,
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  updateAssignment: async (req, res, next) => {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    if (!course.teachers.toString().includes(req.user._id)) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    const { name, point } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
      return;
    }
    assignment.name = name;
    assignment.point = point;
    try {
      await assignment.save();
      res.json({
        code: res.statusCode,
        success: true,
        message: "Assignment updated successfully",
        assignment: assignment,
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  deleteAssignment: async (req, res, next) => {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    if (!course.teachers.toString().includes(req.user._id)) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
      return;
    }
    try {
      course.assignments = course.assignments.filter(
        (assignmentId) => assignmentId.toString() !== assignment._id.toString()
      );
      await course.save();
      await Assignment.deleteOne({ _id: assignment._id });
      res.json({
        code: res.statusCode,
        success: true,
        message: "Assignment deleted successfully",
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  getAssignments: async (req, res, next) => {
    const course = req.course;
    const id = req.params.id;
    if (!course) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Course not found",
      });
      return;
    }
    const assignment = await Assignment.findById(id, null, { lean: true });
    if (!assignment) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
      return;
    }
    if (!req.isTeacher) {
      if (req.isMapped) {
        assignment.grades = assignment.grades.find((grade) => {
          if (
            grade.id.toString() === req.user.student.toString() &&
            !grade.draft
          )
            return true;
        });
        return res.json({
          code: res.statusCode,
          success: true,
          message: "Assignments found",
          assignments: assignment,
        });
      }
      return res.json({
        code: res.statusCode,
        success: true,
        message: "Assignments found",
        assignments: _.omit(assignment, grades),
      });
    }
    res.json({
      code: res.statusCode,
      success: true,
      message: "Assignments found",
      assignments: assignment,
    });
  },

  setCourseStudentIds: async (req, res, next) => {
    const course = req.course;
    let { studentIds } = req.body;
    studentIds = _.uniq(studentIds);
    console.log(studentIds);
    try {
      if (!studentIds) {
        course.studentIds = studentIds;
        await course.save();
      } else {
        await Course.updateOne(
          { _id: course._id },
          {
            $addToSet: {
              studentIds: studentIds,
            },
          }
        );
      }
      res.json({
        code: 200,
        success: true,
        message: "Student ids set successfully",
      });
    } catch (err) {
      res.json({
        code: 500,
        success: false,
        message: err.message,
      });
    }
  },

  getSingleStudentGrade: async (req, res, next) => {
    const id = req.params.id;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
      return;
    }
    if (req.isTeacher) {
      return res.json({
        code: res.statusCode,
        success: true,
        message: "Grade found",
        grade: assignment.grades,
      });
    }
    if (req.isMapped) {
      return res.json({
        code: res.statusCode,
        success: true,
        message: "Grade found",
        grade: assignment.grades.find((grade) => {
          if (
            grade.id.toString() === req.user.student.toString() &&
            !grade.draft
          )
            return true;
        }),
      });
    }
    return res.json({
      code: res.statusCode,
      success: false,
      message: "Unauthorized",
    });
  },

  setSingleStudentGrade: async (req, res, next) => {
    const course = req.course;
    const { studentId, grade } = req.body;
    const assignmentId = req.params.id;
    if (!course.studentIds.includes(studentId)) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Student is not in this class",
      });
      return;
    }
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
      return;
    }
    const filterAssignment = assignment.grades.filter((item) => {
      return item.id.toString() === studentId.toString();
    });
    if (filterAssignment.length > 0) {
      for (let i = 0; i < assignment.grades.length; i++) {
        if (assignment.grades[i].id.toString() === studentId.toString()) {
          assignment.grades[i].draft = true;
          assignment.grades[i].grade = grade;
        }
      }
    } else {
      const item = {
        id: studentId,
        grade,
      };
      assignment.grades.push(item);
    }
    try {
      await assignment.save();
      res.json({
        code: res.statusCode,
        success: true,
        message: "Grade set successfully",
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  setMultipleStudentGrades: async (req, res, next) => {
    const course = req.course;
    const id = req.params.id;
    const { grades } = req.body;
    const studentIds = course.studentIds;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
      return;
    }
    const filteredGrades = grades.filter((item) => {
      if (studentIds.includes(item.id)) {
        return item;
      }
    });
    assignment.grades = filteredGrades;
    try {
      await assignment.save();
      res.json({
        code: res.statusCode,
        success: true,
        message: "Grades set successfully",
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  setMultipleGradeFinalize: async (req, res, next) => {
    const id = req.params.id;
    const course = req.course;
    const studentIds = course.studentIds;
    let assignment = await Assignment.findById(id);
    if (!assignment || !studentIds) {
      return res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
    }
    let grades = assignment.grades;
    const filteredStudentIds = studentIds.filter((studentId) => {
      const filterGrade = grades.find((grade) => {
        if (studentId.toString() === grade.id.toString()) {
          return true;
        }
        return false;
      });
      if (filterGrade) {
        return false;
      }
      return true;
    });
    const newGrades = filteredStudentIds.map((item) => {
      return {
        id: item,
        grade: 0,
        draft: false,
      };
    });
    for (let i = 0; i < grades.length; i++) {
      grades[i].draft = false;
    }
    grades = grades.concat(newGrades);
    assignment.grades = grades;
    try {
      await assignment.save();
      newGrades.forEach(async (item) => {
        await notificationService.gradeFinalizeNotification(
          course._id,
          assignment,
          item.id,
          req.user._id
        );
      });
      res.json({
        code: res.statusCode,
        success: true,
        message: "Finalize grades set successfully",
      });
    } catch (err) {
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  setSingleGradeFinalize: async (req, res, next) => {
    const id = req.params.id;
    const course = req.course;
    const studentId = req.body.studentId;
    const studentIds = course.studentIds;
    if (!studentIds.includes(studentId)) {
      return res.json({
        code: res.statusCode,
        success: false,
        message: "Student is not in this class",
      });
    }
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
    }
    const grades = assignment.grades;
    if (!grades) {
      grades = [];
      assignment.grades = grades;
    }
    const mapGrade = grades.find((item) => {
      if (item.id.toString() === studentId.toString()) {
        return true;
      }
      return false;
    });
    if (mapGrade) {
      mapGrade.draft = false;
    } else {
      mapGrade = {
        id: studentId,
        grade: 0,
        draft: false,
      };
    }
    for (let i = 0; i < grades.length; i++) {
      if (assignment.grades[i].id.toString() === mapGrade.id.toString()) {
        assignment.grades[i] = mapGrade;
      }
    }
    try {
      await assignment.save();
      notificationService.gradeFinalizeNotification(
        course._id,
        assignment,
        studentId,
        req.user._id
      );
      res.json({
        code: res.statusCode,
        success: true,
        message: "Finalize grade set successfully",
      });
    } catch (err) {
      res.json({
        code: 500,
        success: false,
        message: err.message,
      });
    }
  },

  submitGradeReview: async (req, res, next) => {
    const { expectedGrade, message } = req.body;
    const course = req.course;
    const studentId = req.user.student;
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
    }
    const grade = assignment.grades.find((item) => {
      return item.id.toString() === studentId.toString();
    });
    const newReview = new GradeReview({
      studentId,
      assignmentId,
      expectedGrade,
      actualGrade: grade?.grade ?? 0,
      message,
    });
    try {
      await newReview.save();
      await notificationService.newGradeReviewNotification(
        course,
        req.user._id,
        req.user.name,
        assignment
      );
      res.json({
        code: res.statusCode,
        success: true,
        message: "Grade review submitted successfully",
      });
    } catch (err) {
      console.error(err);
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
      });
    }
  },

  getGradeReviews: async (req, res, next) => {
    const assignmentId = req.params.id;
    const { isTeacher } = req;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
    }
    let gradeReviews = await GradeReview.find({ assignmentId });
    if (!isTeacher) {
      gradeReviews = gradeReviews.filter((item) => {
        return item.studentId.toString() === req.user.student.toString();
      });
    }
    res.json({
      code: res.statusCode,
      success: true,
      gradeReviews,
    });
  },

  getSingleReview: async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const assignmentId = req.params.id;
    const { isTeacher } = req;
    const review = await GradeReview.findById(reviewId);
    if (
      !review ||
      review.assignmentId.toString() !== assignmentId.toString() ||
      (!isTeacher &&
        review.studentId.toString() !== req.user.student.toString())
    ) {
      return res.json({
        code: 404,
        success: false,
        message: "Review not found",
      });
    }
    res.json({
      code: res.statusCode,
      success: true,
      review,
    });
  },

  deleteSingleReview: async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const assignmentId = req.params.id;
    const review = await GradeReview.findById(reviewId);
    if (
      !review ||
      review.assignmentId.toString() !== assignmentId.toString() ||
      (!isTeacher &&
        review.studentId.toString() !== req.user.student.toString())
    ) {
      return res.json({
        code: 404,
        success: false,
        message: "Review not found",
      });
    }
    try {
      await review.remove();
      res.json({
        code: res.statusCode,
        success: true,
        message: "Review deleted successfully",
      });
    } catch (err) {
      res.json({
        code: 500,
        success: false,
        message: err.message,
      });
    }
  },

  reviewAddComment: async (req, res, next) => {
    const { content } = req.body;
    const reviewId = req.params.reviewId;
    const assignmentId = req.params.id;
    const course = req.course;
    const isTeacher = req;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.json({
        code: res.statusCode,
        success: false,
        message: "Assignment not found",
      });
    }
    const review = await GradeReview.findById(reviewId);
    const student = await User.findOne({ student: review.studentId });
    if (
      !review ||
      review.assignmentId.toString() !== assignmentId.toString() ||
      (!isTeacher &&
        review.studentId.toString() !== req.user.student.toString())
    ) {
      return res.json({
        code: 404,
        success: false,
        message: "Review not found",
      });
    }
    const newComment = {
      userId: req.user._id,
      name: req.user.name,
      content,
    };
    review.comments.push(newComment);
    try {
      await review.save();
      if (student)
        await notificationService.newCommentNotification(
          course._id,
          student._id,
          req.user._id,
          req.user.name,
          assignment
        );
      res.json({
        code: res.statusCode,
        success: true,
        message: "Comment added successfully",
        comment: _.last(review.comments),
      });
    } catch (err) {
      console.error(err);
      res.json({
        code: 500,
        success: false,
        message: err.message,
      });
    }
  },

  markFinalReview: async (req, res, next) => {
    const { grade, approve } = req.body;
    const reviewId = req.params.reviewId;
    const course = req.course;
    const assignmentId = req.params.id;
    const review = await GradeReview.findById(reviewId);
    const student = await User.findOne({ student: review.studentId });
    if (!review || review.assignmentId.toString() !== assignmentId.toString()) {
      return res.json({
        code: 404,
        success: false,
        message: "Review not found",
      });
    }
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.json({
        code: 404,
        success: false,
        message: "Assignment not found",
      });
    }
    if (!approve) {
      review.status = 2;
      try {
        await review.save();
        if (student)
          await notificationService.markReviewNotification(
            course._id,
            student._id,
            req.user._id,
            req.user.name,
            assignment,
            false
          );
        return res.json({
          code: res.statusCode,
          success: true,
          message: "Review marked as not approved",
        });
      } catch (err) {
        console.error(err);
        res.json({
          code: 500,
          success: false,
          message: err.message,
        });
      }
    }
    const trueGrade = assignment.grades.find(
      (item) => item.id.toString() === review.studentId.toString()
    );
    if (trueGrade) {
      trueGrade.grade = grade ?? review.expectedGrade;
    } else {
      assignment.grades.push({
        id: review.studentId,
        grade,
      });
    }
    try {
      await assignment.save();
      review.status = 1;
      await review.save();
      if (student)
        notificationService.markReviewNotification(
          course._id,
          student._id,
          req.user._id,
          req.user.name,
          assignment,
          true
        );
      res.json({
        code: res.statusCode,
        success: true,
        message: "Review marked as approved",
      });
    } catch (err) {
      console.error(err);
      res.json({
        code: 500,
        success: false,
        message: err.message,
      });
    }
  },
};
