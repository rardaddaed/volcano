var createError = require('http-errors');
var express = require('express'),
  bodyParser = require("body-parser"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config();

var authRouter = require('./routes/auth');
var countriesRouter = require('./routes/countries');
var volcanoesRouter = require('./routes/volcanoes');
var meRouter = require('./routes/me');
var profileRouter = require('./routes/profile');
var singleVolcanoRouter = require('./routes/singleVolcano');
var indexRouter = require('./routes/index');

var app = express();
app.use(logger('dev'));
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const options = require('./knexfile').production;
const knex = require('knex')(options);
app.use((req, res, next) => {
  req.db = knex;
  next();
});

const definition = require('./swagger.json');
const { allowedNodeEnvironmentFlags } = require('process');
const swaggerOptions = {
  definition,
  apis: [],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.setHeader("access-control-allow-origin", '*');
  next();
});


app.use('/me', meRouter);
app.use('/volcanoes', volcanoesRouter);
app.use('/volcano', singleVolcanoRouter);
app.use('/countries', countriesRouter);
app.use('/user', authRouter);
app.use('/user', profileRouter);
app.use('/', indexRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
