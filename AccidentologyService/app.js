var createError = require('http-errors');
var express = require('express');
const mysql = require('mysql');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
var multiplierRouter = require('./routes/multiplier');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/multiplier', multiplierRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Create a BD connection
//The user has only read privileges on the db
var con = mysql.createConnection({
  host: "localhost",
  user: "accidentReader",
  password: "mdpAccidentReader-1",
  database: "accidentDB4T"
});

con.connect(function(err) {
 if (err) throw err
});

// to avoid unnecessary roundtrips to the database let's put the database values that
// are needed in every request in a cache
var cache = {};
initCache(cache);

// This function sets up the cache asynchroneously
function initCache(cache) {
	var sqlAccForAverageRiskStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` FROM `lieu`";
	   // use the connection to query the DB for accidents in average route category
    con.query(sqlAccForAverageRiskStr, function (err, result, fields) {
      if (err) throw err;
      var nbAcc = result[0].nb_accidents;
      cache.nbAccTotal = nbAcc;   
   });
    var sqlKmAverageRiskQueryStr = "SELECT * FROM route WHERE `routeCode` = 0";
    con.query(sqlKmAverageRiskQueryStr, function (err, result, fields) {
      if (err) throw err;
      var nbKm = result[0].km;
      cache.nbKmCatrTotal = nbKm;
   });
   var sqlKmAverageMeteoRiskQueryStr = "SELECT * FROM meteo WHERE `meteoCode` = 10";
    con.query(sqlKmAverageMeteoRiskQueryStr, function (err, result, fields) {
      if (err) throw err;
      var nbKm = result[0].km;
      cache.nbKmMeteoTotal = nbKm;
   });
}

console.log("app started");

module.exports = app;
exports.con = con;
exports.cache = cache;
