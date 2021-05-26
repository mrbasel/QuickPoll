const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index.html");
});

router.get("/login", function (req, res, next) {
  res.render("login.html");
});

router.get("/register", function (req, res, next) {
  res.render("register.html");
});

module.exports = router;
