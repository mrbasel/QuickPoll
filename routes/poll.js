const express = require("express");

const db = require("../db.js");

const router = express.Router();

router.get("/createPoll", function (req, res, next) {
  res.render("createPoll");
});

router.post("/createPoll", function (req, res, next) {
  console.log(req.body);
  const question = req.body.question;
  const date = req.body.date;

  delete req.body.question;
  delete req.body.date;

  const choices = Object.values(req.body);

  db.Polls.createPoll(question)
    .then((data) => console.log(data))
    .catch((data) => console.log("ERROR: " + data));

  res.redirect("/");
});

module.exports = router;
