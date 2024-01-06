const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const authenticate = require("../authenticate");
const User = require("../models/User");
const { email, CLIENT_URL } = require("../config/mainConfig");
const _ = require("lodash");

module.exports = {
  // [POST] /auth/login
  postLogin: async (req, res) => {
    // console.log(req.body);
    const user = await User.findOne({ email: req.body.email });
    if (
      user &&
      (await bcrypt.compare(req.body.password, user ? user.password : ""))
    ) {
      if (!user.status)
        return res.json({
          status: res.statusCode,
          success: false,
          message:
            "Your account has been disabled. Please contact the administrator.",
        });
      if (user.activationCode != "" && user.activationCode !== undefined)
        return res.json({
          status: res.statusCode,
          success: false,
          message:
            "Your account has not been activated. Please double-check your email.",
        });
      const jwt = authenticate.getToken(user);
      res.json({
        code: res.statusCode,
        success: true,
        user,
        jwt,
      });
      // console.log("Logged in successfully");
    } else {
      // console.log("Email does not exist");
      res.json({
        code: res.statusCode,
        success: false,
        message: "Incorrect email or password",
      });
    }
  },

  // [POST] /auth/register
  postRegister: async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.json({
        code: res.statusCode,
        success: false,
        message: "The user already exists!",
      });
    } else {
      const newUser = new User(req.body);
      const date = new Date();
      newUser.type = 1;
      newUser.activationCode =
        _.random(0, 1000000) + newUser.email + _.random(0, 1000000);
      newUser.password = bcrypt.hashSync(req.body.password, 10);
      await newUser.save();
      /////////////////////////////////////////////////////////////////
      /// Send mail to get activationCode here ////////////////////////
      /// URL: {EP}/auth/activation?activationCode={activationCode} ///
      /////////////////////////////////////////////////////////////////
      const link = `${CLIENT_URL}/auth/activation?activationCode=${newUser.activationCode}`;
      const message = `<p>Click this link to activate your account: <a href="${link}">Link</a></p>`;
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
        to: req.body.email, // list of receivers
        subject: "Activate your account", // Subject line
        text: "Activate your account", // plain text body
        html: message, // html body
      });

      res.json({
        code: res.statusCode,
        success: true,
        message:
          "Successful account registration. An email has been sent. Please check your inbox.",
      });
    }
  },

  // [GET] /auth/:provider/token
  socialLogin: (req, res) => {
    if (req.user) {
      const jwt = authenticate.getToken(req.user);
      res.json({
        code: res.statusCode,
        success: true,
        user: req.user,
        jwt,
      });
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Unauthorized",
      });
    }
  },

  // [POST] /auth/admin/login
  postAdminLogin: async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || (user && !user.password)) {
      return res.status(401).json({
        code: res.statusCode,
        success: false,
        message: "The admin does not exist!",
      });
    }
    if ((await bcrypt.compare(req.body.password, user.password)) === false) {
      return res.status(401).json({
        code: res.statusCode,
        success: false,
        message: "Incorrect password!",
      });
    }
    if (user.type !== 0) {
      return res.status(401).json({
        code: res.statusCode,
        success: false,
        message: "You are not an admin!",
      });
    }
    const jwt = authenticate.getToken(user);
    res.status(200).json({
      code: res.statusCode,
      success: true,
      user,
      jwt,
    });
  },

  // [POST] /auth/forgot-password
  postForgotPassword: async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (!user.status) {
        res.json({
          status: res.statusCode,
          success: false,
          message:
            "Your account has been disabled. Please contact the administrator.",
        });
      } else {
        ///////////////////////////////////////////////////////////
        /// Send mail to get postForgotPassword here //////////////
        /// URL: {EP}/auth/forgot-password/{forgotPasswordCode} ///
        //////////////////////////////////////////////////////////
        ////
        const date = new Date();
        user.forgotPasswordCode =
          _.random(0, 1000000) + user.email + _.random(0, 1000000);
        await user.save();

        const link = `${CLIENT_URL}/auth/forgot-password/${user.forgotPasswordCode}`;
        const message = `<p>Click this link to reset your password: <a href="${link}">Link</a></p>`;
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
          to: req.body.email, // list of receivers
          subject: "Reset your password", // Subject line
          text: "Reset password", // plain text body
          html: message, // html body
        });

        res.json({
          code: res.statusCode,
          success: true,
          message: "An email has been sent. Please check your inbox.",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Email not found!",
      });
    }
  },

  // [GET] /auth/forgot-password/:forgotPasswordCode
  getCheckForgotPasswordCode: async (req, res) => {
    const user = await User.findOne({
      forgotPasswordCode: req.params.forgotPasswordCode,
    });
    if (user) {
      if (!user.status) {
        res.json({
          status: res.statusCode,
          success: false,
          message:
            "Your account has been disabled. Please contact the administrator.",
        });
      } else {
        res.json({
          code: res.statusCode,
          success: true,
          message: "OK",
          email: user.email,
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Invalid link!",
      });
    }
  },

  // [POST] /auth/forgot-password/:forgotPasswordCode
  resetPassword: async (req, res) => {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (user) {
      if (!user.status) {
        res.json({
          status: res.statusCode,
          success: false,
          message:
            "Your account has been disabled. Please contact the administrator.",
        });
      } else {
        user.password = bcrypt.hashSync(req.body.password, 10);
        user.forgotPasswordCode = "";
        await user.save();
        res.json({
          code: res.statusCode,
          success: true,
          message: "Password reset successful.",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Invalid link!",
      });
    }
  },

  // [GET] /auth/activation/:activationCode
  activation: async (req, res) => {
    const user = await User.findOne({
      activationCode: req.params.activationCode,
    });
    if (user) {
      if (!user.status) {
        res.json({
          status: res.statusCode,
          success: false,
          message:
            "Your account has been disabled. Please contact the administrator.",
        });
      } else {
        user.activationCode = "";
        await user.save();
        res.json({
          code: res.statusCode,
          success: true,
          message: "Account activation successful.",
        });
      }
    } else {
      res.json({
        code: res.statusCode,
        success: false,
        message: "Invalid link!",
      });
    }
  },
};
