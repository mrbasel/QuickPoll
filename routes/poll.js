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

  let url_id;
  db.Polls.createPoll(question)
    .then((data) => {
      url_id = data.url_id;
      return db.Polls.addChoices(data.poll_id, choices);
    })
    .then(() => res.redirect("/poll/" + url_id))
    .catch((data) => {
      console.log("ERROR: " + data);
      res.redirect("/");
    });
});

router.get("/:pollId", function (req, res, next) {
  const pollId = req.params.pollId;
  let question;

  db.Polls.getPoll(pollId)
    .then((data) => {
      question = data.question;
      return db.Polls.getChoices(data.poll_id);
    })
    .then((data) => {
      let canVote = true;
      if (req.cookies[pollId] !== undefined) canVote = false;

      res.render("poll", {
        question: question,
        choices: data,
        canVote: canVote,
      });
    })
    .catch((e) => {
      console.log(e);
      res.redirect("/");
    });
});

router.post("/:pollId", function (req, res, next) {
  const choice = req.body.choice;
  const urlId = req.url.slice(1);

  res.setHeader("set-cookie", `${urlId}=${choice}; Max-Age=86400`);

  db.Polls.getPoll(urlId)
    .then((poll) => {
      return db.Polls.vote(poll.poll_id, choice);
    })
    .catch((e) => console.log("ERROR: " + e));

  res.redirect("/");
});

module.exports = router;
