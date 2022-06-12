var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  if (Object.keys(req.query).length === 0) {
    res.status(400).json({ error: true, message: "Bad Request." });
    return;
  }
  for (let query in req.query) {
    if ((query !== 'country' && query !== 'populatedWithin')) {
      res.status(400).json({ error: true, message: "Invalid query parameters. Only country and populatedWithin are permitted." });
      return;
    }
  }
  const country = req.query.country;
  const populatedWithin = req.query.populatedWithin;
  if (!country) {
    res.status(400).json({ error: true, message: "Country is a required query parameter." });
    return;
  }


  let dbQuery = req.db.from('data').select('*').where('country', '=', country);
  if (populatedWithin) {
    switch (populatedWithin) {
      case '5km':
        dbQuery = dbQuery.andWhere('population_5km', '>', 0);
        break;
      case '10km':
        dbQuery = dbQuery.andWhere('population_10km', '>', 0);
        break;
      case '30km':
        dbQuery = dbQuery.andWhere('population_30km', '>', 0);
        break;
      case '100km':
        dbQuery = dbQuery.andWhere('population_100km', '>', 0);
        break;
      default:
        res.status(400).json({ error: true, message: "Invalid value for populatedWithin. Only: 5km,10km,30km,100km are permitted." });
        return;
    }
  }

  dbQuery
    .then(rows => {
      res.json(rows.map(row => {
        return {
          "id": row.id,
          "name": row.name,
          "country": row.country,
          "region": row.region,
          "subregion": row.subregion
        }
      }))
    })
});


module.exports = router;
