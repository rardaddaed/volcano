var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const authorize = require('./authorize');
const { parse } = require('dotenv');

router.get('/:email/profile', authorize.authorize, function (req, res) {
  const email = req.params.email;
  let dbData = req.db.from('users').select('*').where('email', '=', email);

  dbData
    .then(rows => {
      if (rows.length < 1) {
        res.status(404).json({ error: true, message: "User not found" });
        return;
      }
      if (req.noToken || email !== req.emailIdentity) {
        res.json({
          "email": rows[0].email,
          "firstName": rows[0].firstName,
          "lastName": rows[0].lastName
        });
      } else {
        res.json({
          "email": rows[0].email,
          "firstName": rows[0].firstName,
          "lastName": rows[0].lastName,
          "dob": rows[0].dob === null ? null : new Intl.DateTimeFormat("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(rows[0].dob),
          "address": rows[0].address
        });
      }
    })
});

router.put('/:email/profile', authorize.authorize, function (req, res) {
  if (req.noToken) {
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed"
    });
    return;
  }
  const email = req.params.email;
  if (email !== req.emailIdentity) {
    res.status(403).json({
      error: true,
      message: "Cannot modify other user's profile."
    });
    return;
  }
  if (!req.body.firstName || !req.body.lastName || !req.body.dob || !req.body.address) {
    res.status(400).json({ error: true, message: "Request body incomplete: firstName, lastName, dob and address are required." });
    return;
  }
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dobString = req.body.dob;
  const dob = new Date(dobString);
  const address = req.body.address;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  let date = new Date();


  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string') {
    res.status(400).json({ error: true, message: "Request body invalid: firstName, lastName and address must be strings only." });
    return;
  }

  if (dobString.match(dateRegex)) {
    const dobParts = dobString.split('-');
    if ((isNaN(dob) || dob == 'Invalid Date') || !isValidDate(dobParts[0], dobParts[1], dobParts[2])) {
      res.status(400).json({ error: true, message: "Invalid input: dob must be a real date in format YYYY-MM-DD." });
      return;
    }
  } else {
    res.status(400).json({ error: true, message: "Invalid input: dob must be a real date in format YYYY-MM-DD." });
    return;
  }

  if (dob.setHours(0, 0, 0, 0) >= date.setHours(0, 0, 0, 0)) {
    res.status(400).json({ error: true, message: 'Invalid input: dob must be a date in the past.' });
    return;
  }



  req.db.from('users').where('email', '=', email)
    .update({ 'firstName': firstName, 'lastName': lastName, 'dob': dob, 'address': address })
    .then(() => {
      return req.db.from('users').select('*').where('email', '=', email);
    })
    .then((rows) =>
      res.status(200).json({
        "email": rows[0].email,
        "firstName": rows[0].firstName,
        "lastName": rows[0].lastName,
        "dob": rows[0].dob === null ? null : new Intl.DateTimeFormat("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(rows[0].dob),
        "address": rows[0].address
      }));;
});

function isValidDate(year, month, day) {
  const monthNumber = parseInt(month, 10);

  var d = new Date(year, monthNumber - 1, day);
  if (d.getFullYear() == year && d.getMonth() == monthNumber - 1 && d.getDate() == day) {
    return true;
  }
  return false;
}


module.exports = router;