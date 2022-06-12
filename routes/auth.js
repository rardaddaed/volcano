
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* Register */
router.post('/register', function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
    return;
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    res.status(400).json({
      error: true,
      message: "Invalid format email address"
    });
    return;
  }

  req.db.from("users").select("*").where({ email })
    .then(users => {
      if (users.length > 0) {
        res.status(409).json({
          error: true,
          message: "User already exists"
        });
        return;
      }

      const hash = bcrypt.hashSync(password, 10);
      req.db.from("users").insert({ email, hash })
        .then(() => {
          res.status(201).json({
            message: "User created"
          });
        })
    })
})

/* Login */
router.post('/login', function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
    return;
  }
  req.db.from("users").select("*").where('email', '=', email)
    .then(users => {

      if (users.length === 0) {
        res.status(401).json({
          error: true,
          message: "Request body incomplete, both email and password are required"
        });
        return;
      }

      const { hash } = users[0];

      if (!bcrypt.compareSync(password, hash)) {
        res.status(401).json({
          error: true,
          message: "Incorrect email or password"
        });
        return;
      }
      const expires_in = 60 * 60 * 24;

      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, process.env.SECRET_KEY);

      res.status(200).json({
        token,
        token_type: "Bearer",
        expires_in
      });
    })
});

module.exports = router;
