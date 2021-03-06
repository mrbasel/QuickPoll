const express = require("express");
const pgp = require("pg-promise");

const db = require("../db.js");

const PollDeadlineError = require("../errors.js");
const QueryResultError = pgp.errors.QueryResultError;

const router = express.Router();

router.get("/create", function (req, res, next) {
  res.render("createPoll.html");
});

router.post("/create", async function (req, res, next) {
  const question = req.body.question;
  let date = req.body.date;

  if (question === "") return res.redirect(303, "/poll/create");

  // Set the deadline to be 7 days
  // if no deadline is provided
  if (!date) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    date = currentDate.toISOString().split("T")[0];
  }

  if (new Date() > new Date(date)) return res.redirect(303, "/poll/create");

  // Remove question and date so that only the choices
  // will be remaining in the body
  delete req.body.question;
  delete req.body.date;
  let choices = Object.values(req.body);
  
  // Remove testfields that were left empty
  choices = choices.filter((elem) => elem !== "");

  if (choices.length < 2) return res.redirect(303, "/poll/create");

  try {
    const pollData = await db.Polls.createPoll(
      question,
      date + " 23:59:00",
      choices
    );
    res.redirect("/poll/" + pollData.url_id);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get("/:pollId", async function (req, res, next) {
  const pollId = req.params.pollId;

  try {
    const pollData = await db.Polls.getPoll(pollId);
    if (new Date() > new Date(pollData.deadline_date))
      throw new PollDeadlineError("Poll is already finished");

    const pollChoices = await db.Choices.getChoices(pollData.poll_id);
    let canVote = true;
    if (req.cookies[pollId] !== undefined) canVote = false;

    res.render("poll.html", {
      question: pollData.question,
      choices: pollChoices,
      canVote: canVote,
      pollId: pollId,
    });
  } catch (e) {
    if (e instanceof PollDeadlineError)
      res.redirect(req.originalUrl + "/results");
    else if (e instanceof QueryResultError) next();
    else {
      console.error(e);
      next(e);
    }
  }
});

router.post("/:pollId", async function (req, res, next) {
  const choice = req.body.choice;
  const urlId = req.url.slice(1);

  if (req.cookies[urlId] !== undefined)
    res.redirect(req.originalUrl + "/results");
  else {
    try {
      const pollData = await db.Polls.getPoll(urlId);
      const cookieExpiryDate = new Date(pollData.deadline_date).toUTCString();
      res.setHeader(
        "set-cookie",
        `${urlId}=${choice}; Expires=${cookieExpiryDate}; Secure; HttpOnly`
      );

      await db.Polls.vote(pollData.poll_id, choice);

      res.redirect(req.originalUrl + "/results");
    } catch (e) {
      console.error(e);
      next(e);
    }
  }
});

router.get("/:pollId/results", async function (req, res, next) {
  const urlId = req.url.slice(1).split("/")[0];
  try {
    const pollData = await db.Polls.getPoll(urlId);

    res.render("results.html", {
      question: pollData.question,
    });
  } catch (e) {
    if (e instanceof QueryResultError) next();
    else {
      console.error(e);
      next(e);
    }
  }
});

router.get("/:pollId/data", async function (req, res, next) {
  const urlId = req.url.slice(1).split("/")[0];

  try {
    const pollData = await db.Polls.getPoll(urlId);
    const pollChoices = await db.Choices.getChoices(pollData.poll_id);

    const data = {
      labels: pollChoices.map((elem) => elem.choice_text),
      datasets: [
        {
          label: "# of Votes",
          data: pollChoices.map((elem) => elem.vote_count),
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
  } catch (e) {
    if (e instanceof QueryResultError) res.sendStatus(404).end();
    else {
      console.error(e);
      next(e);
    }
  }
});

module.exports = router;
