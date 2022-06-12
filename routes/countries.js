var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  req.db.from('data').distinct('country').orderBy('country')
    .then(rows => {
      res.json(rows.map(row => { return row.country }));
    })
});

module.exports = router;