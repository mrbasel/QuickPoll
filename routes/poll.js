const express = require("express");

const db = require("../db.js");
const PollDeadlineError = require("../errors.js");

const router = express.Router();

router.get("/create", function (req, res, next) {
  res.render("createPoll.html");
});

router.post("/create", async function (req, res, next) {
  const question = req.body.question;
  const date = req.body.date;
  // Remove question and date so that only the choices
  // will be remaining in the body
  delete req.body.question;
  delete req.body.date;
  let choices = Object.values(req.body);

  // Remove testfields that were left empty
  choices = choices.filter((elem) => elem !== "");

  try {
    const pollData = await db.Polls.createPoll(question, date + " 21:50:00");
    await db.Polls.addChoices(pollData.poll_id, choices);
    res.redirect("/poll/" + pollData.url_id);
  } catch (e) {
    console.error(e);
    res.redirect("/");
  }
});

router.get("/:pollId", async function (req, res, next) {
  const pollId = req.params.pollId;

  try {
    const pollData = await db.Polls.getPoll(pollId);
    if (new Date() > pollData.deadline_date)
      throw new PollDeadlineError("Poll is already finished");

    const pollChoices = await db.Polls.getChoices(pollData.poll_id);
    pollChoices.sort((a, b) => a.choice_id - b.choice_id);
    let canVote = true;

    if (req.cookies[pollId] !== undefined) canVote = false;

    res.render("poll.html", {
      question: pollData.question,
      choices: pollChoices,
      canVote: canVote,
      pollId: pollId,
    });
  } catch (e) {
    console.log(e);
    if (e instanceof PollDeadlineError)
      res.redirect(req.originalUrl + "/results");
    else res.redirect("/");
  }
});

router.post("/:pollId", async function (req, res, next) {
  const choice = req.body.choice;
  const urlId = req.url.slice(1);

  if (req.cookies[urlId] !== undefined)
    res.redirect(req.originalUrl + "/results");
  else {
    res.setHeader("set-cookie", `${urlId}=${choice}; Max-Age=86400`);
    try {
      const pollData = await db.Polls.getPoll(urlId);
      await db.Polls.vote(pollData.poll_id, choice);

      res.redirect(req.originalUrl + "/results");
    } catch (e) {
      res.redirect("/");
      console.log("ERROR: " + e);
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
    console.log(e);
    res.sendStatus(404);
  }
});

router.get("/:pollId/data", async function (req, res, next) {
  const urlId = req.url.slice(1).split("/")[0];

  try {
    const pollData = await db.Polls.getPoll(urlId);
    const pollChoices = await db.Polls.getChoices(pollData.poll_id);

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
    console.log(e);
    res.sendStatus(404);
  }
});

module.exports = router;
