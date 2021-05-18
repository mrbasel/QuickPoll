var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/createPoll', function (req, res, next) {
    res.render('createPoll');
});

module.exports = router;
