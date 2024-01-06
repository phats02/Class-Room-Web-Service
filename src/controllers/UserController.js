const bcrypt = require("bcrypt");
const authenticate = require("../authenticate");
const User = require("../models/User");

class UserController {
  // [GET] /users
  index(req, res, next) {
    User.find({ type: { $ne: 0 } })
      .then((users) => {
        res.json({
          code: res.statusCode,
          success: true,
          users,
        });
      })
      .catch(next);
  }

  // [GET] /users/:id
  show(req, res, next) {
    User.findById(req.params.id)
      .then((user) => {
        res.json({
          code: res.statusCode,
          success: true,
          user,
        });
      })
      .catch(next);
  }

  // [PUT] /users/:id
  async update(req, res, next) {
    const student = req.body.student;
    if (student) {
      const matchedStudent = await User.findOne({ student });
      if (matchedStudent && matchedStudent._id.toString() !== req.params.id) {
        res.json({
          code: res.statusCode,
          success: false,
          message: "StudentId already exists",
        });
        return;
      }
    }
    User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then((user) => {
        res.json({
          code: res.statusCode,
          success: true,
          user,
        });
      })
      .catch(next);
  }

  // [GET] /users/student/:student
  checkStudent(req, res, next) {
    User.findOne({ student: req.params.student })
      .then((user) => {
        res.json({
          code: res.statusCode,
          success: true,
          user,
        });
      })
      .catch(next);
  }

  async postCreateAdmin(req, res, next) {
    const { email, password, name, phoneNumber } = req.body;
    if (password.length > 16 || password.length < 8) {
      res.status(400).json({
        code: res.statusCode,
        success: false,
        message: "Password must be 8-16 characters",
      });
    }
    const admin = await User.findOne({ email: email });
    if (admin) {
      res.status(400).json({
        code: res.statusCode,
        success: false,
        message: "Email already existed!",
      });
    }
    const newAdmin = new User({
      email,
      password: bcrypt.hashSync(req.body.password, 10),
      name,
      phoneNumber,
      type: 0,
    });

    await newAdmin.save();
    res.status(201).json({
      code: res.statusCode,
      success: true,
      admin: newAdmin,
      message: "Create admin successfully!",
    });
  }

  // [GET] /users/admins
  getAdmins(req, res, next) {
    User.find({ type: 0 })
      .then((admins) => {
        res.status(200).json({
          code: res.statusCode,
          success: true,
          admins,
        });
      })
      .catch(next);
  }

  // [POST] /users/ban
  postBan(req, res, next) {
    User.findByIdAndUpdate(req.body.id, { status: 0 }, { new: true })
      .then((user) => {
        res.status(200).json({
          code: res.statusCode,
          success: true,
          user,
        });
      })
      .catch(next);
  }

  // [POST] /users/unlock
  postUnlock(req, res, next) {
    User.findByIdAndUpdate(req.body.id, { status: 1 }, { new: true })
      .then((user) => {
        res.status(200).json({
          code: res.statusCode,
          success: true,
          user,
        });
      })
      .catch(next);
  }

  // [PATCH] /users/map
  mapStudentId(req, res, next) {
    User.findOne({ student: req.body.student }).then((user) => {
      if (user) {
        res.status(400).json({
          code: res.statusCode,
          success: false,
          message: "StudentId already exists",
        });
        return;
      } else {
        User.findByIdAndUpdate(
          req.body.id,
          { student: req.body.student },
          { new: true }
        )
          .then((user) => {
            res.status(200).json({
              code: res.statusCode,
              success: true,
              user,
            });
          })
          .catch(next);
      }
    });
  }

  // [PATCH]
  unmapStudentId(req, res, next) {
    User.findByIdAndUpdate(req.body.id, { student: null }, { new: true })
      .then((user) => {
        res.status(200).json({
          code: res.statusCode,
          success: true,
          user,
        });
      })
      .catch(next);
  }
}

module.exports = new UserController();
