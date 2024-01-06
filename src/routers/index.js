const siteRouter = require("./site");
const authRouter = require("./auth");
const coursesRouter = require("./courses");
const usersRouter = require("./users");
const notificationRouter = require("./notification");

function route(app) {
  app.use("/users", usersRouter);
  app.use("/courses", coursesRouter);
  app.use("/auth", authRouter);
  app.use("/notification", notificationRouter);
  app.use("/", siteRouter);
}

module.exports = route;
