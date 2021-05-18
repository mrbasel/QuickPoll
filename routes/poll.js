const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/createPoll", function (req, res, next) {
  res.render("createPoll");
});

module.exports = router;
