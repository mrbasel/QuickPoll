const express = require("express");

const db = require("../db.js");

const router = express.Router();

router.get("/create", function (req, res, next) {
  res.render("createPoll");
});

router.post("/create", function (req, res, next) {
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
      data.sort((a, b) => a.choice_id - b.choice_id);
      let canVote = true;
      if (req.cookies[pollId] !== undefined) canVote = false;

      res.render("poll", {
        question: question,
        choices: data,
        canVote: canVote,
        pollId: pollId,
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
    .then(() => res.redirect(req.originalUrl + "/results"))
    .catch((e) => {
      res.redirect("/");
      console.log("ERROR: " + e);
    });
});

router.get("/:pollId/results", function (req, res, next) {
  const urlId = req.url.slice(1).split("/")[0];

  db.Polls.getPoll(urlId)
    .then((poll) => {
      res.render("results", {
        question: poll.question,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    });
});

router.get("/:pollId/data", function (req, res, next) {
  const urlId = req.url.slice(1).split("/")[0];
  db.Polls.getPoll(urlId)
    .then((poll) => db.Polls.getChoices(poll.poll_id))
    .then((choices) => {
      const data = {
        labels: choices.map((elem) => elem.choice_text),
        datasets: [
          {
            label: "# of Votes",
            data: choices.map((elem) => elem.vote_count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };

      res.json(data);
    });
});

module.exports = router;
