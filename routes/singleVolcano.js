var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

const authWithLimitAccess = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    next();
    return;
  }
  if (auth.split(" ").length !== 2) {
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed"
    });
    return;
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    if (Date.now() > payload.exp) {
      res.status(401).json({
        error: true,
        message: "Expired JWT"
      });
      return;
    }

    next();
  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token"
    });
    return;
  }
};


router.get('/:id', authWithLimitAccess, function (req, res) {
  const auth = req.headers.authorization;

  const id = req.params.id;
  let dbData = req.db.from('data').select('*').where('id', '=', id);
  dbData
    .then(rows => {
      if (rows.length < 1) {
        res.status(404).json({ error: true, message: `Volcano with ID: ${id} not found.` });
        return;
      }

      if (!auth) {
        res.json({
          "id": rows[0].id,
          "name": rows[0].name,
          "country": rows[0].country,
          "region": rows[0].region,
          "subregion": rows[0].subregion,
          "last_eruption": rows[0].last_eruption,
          "summit": rows[0].summit,
          "elevation": rows[0].elevation,
          "latitude": rows[0].latitude,
          "longitude": rows[0].longitude
        })
      } else {
        res.json({
          "id": rows[0].id,
          "name": rows[0].name,
          "country": rows[0].country,
          "region": rows[0].region,
          "subregion": rows[0].subregion,
          "last_eruption": rows[0].last_eruption,
          "summit": rows[0].summit,
          "elevation": rows[0].elevation,
          "latitude": rows[0].latitude,
          "longitude": rows[0].longitude,
          "population_5km": rows[0].population_5km,
          "population_10km": rows[0].population_10km,
          "population_30km": rows[0].population_30km,
          "population_100km": rows[0].population_100km
        })
      }
    })
});

module.exports = router;