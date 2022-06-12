var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.json({ name: 'Jinyu Li', student_number: 'n10775676' });
});

module.exports = router;