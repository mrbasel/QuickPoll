const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotEnv = require("dotenv").config();
const nunjucks = require("nunjucks");

const indexRouter = require("./routes/index");
const pollRouter = require("./routes/poll");
const db = require("./db.js");

const app = express();
db.createTables();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "nunjucks");
nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/poll", pollRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error.html");
});

// 404 page route
app.use(function (req, res, next) {
  res.status(404).render("404.html");
});

module.exports = app;
