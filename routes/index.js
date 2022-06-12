var express = require('express');
var router = express.Router();
var createError = require('http-errors');

router.get('/', function (req, res, next) {
    res.redirect('/api-docs');
});

router.get('/*', function (req, res, next) {
    next(createError(404));
});

module.exports = router;