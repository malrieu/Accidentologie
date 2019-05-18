//Load modules
const express = require("express");
const mysql = require('mysql');

//Create express app
const app = express();

//Create a BD connection
//The user has only read privileges on the db
  var con = mysql.createConnection({
     host: "localhost",
     user: "accidentReader",
     password: "***********",
     database: "accidentDB4T"
  });
  
  con.connect(function(err) {
    if (err) throw err
});

// to avoid unnecessary roundtrips to the database let's put the database values that
// are needed in every request in a cache
var cache = {};
initCache(cache);

// default express route (url convention)
app.get('/', function(req, res){
	res.send("Service to get risk multiplier")
});

// // main express route (url convention)
app.get('/multiplier', function(req, res){
  var catr = req.query.catr;
  var meteo = req.query.meteo;
  var response = "";
  if ( catr != null && isCorrectCatrCode(catr) )
    
    response = getMultiplierStrAndSend(catr,meteo,res);
  
  });

// this function calculates the multiplier and sends the response in json format
function getMultiplierStrAndSend(catr,meteo,res) {
  var sqlAccForCatrQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `catr` FROM `lieu` WHERE `catr` = " + catr;
  var sqlKmForCatrQueryStr = "SELECT (`km`) FROM route WHERE `routeCode` = " + catr;
  
  // use the connection to query the DB for accidents, then for km
  // TODO: do this asynchroneously using Promise.all()
    con.query(sqlAccForCatrQueryStr, function (err, result1, fields) {
	if (err) throw err;
	con.query(sqlKmForCatrQueryStr, function (err, result2, fields) {
		if (err) throw err;
		var multiplier = getMultiplier(result1[0].nb_accidents,result2[0].km);
		res.send("{ \"multiplier\" : " + multiplier + "}");
	});
   });
}

// this function calculates and return the numerical risk multiplier
function getMultiplier(accidentNumber, numberKm) {
	var multiplier = (accidentNumber / cache.nbAccForAverageRiskRouteCategory) * (cache.nbKmForAverageRiskRouteCategory / numberKm);
	console.log("calcul:" + multiplier);
	return multiplier;
}

// This function sets up the cache asynchroneously
function initCache(cache) {
	var sqlAccForAverageRiskStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `catr` FROM `lieu` WHERE `catr` = 2";
	   // use the connection to query the DB for accidents in average route category
    con.query(sqlAccForAverageRiskStr, function (err, result, fields) {
		if (err) throw err;
		var nbAcc = result[0].nb_accidents;
		cache.nbAccForAverageRiskRouteCategory = nbAcc;
   });
    var sqlKmAverageRiskQueryStr = "SELECT * FROM route WHERE `averageRisk` = 1";
    con.query(sqlKmAverageRiskQueryStr, function (err, result, fields) {
		if (err) throw err;
		var nbKm = result[0].km;
		cache.nbKmForAverageRiskRouteCategory = nbKm;
   });
}

function isCorrectCatrCode(catrCode) {
  if ( !isNaN(catrCode) && 0 < catrCode && catrCode < 6 )
    return true;
  else
    return false;
}

function isCorrectMeteoCode(meteoCode) {
  if ( !isNaN(meteoCode) && 0 < meteoCode && meteoCode < 9 )
    return true;
  else
    return false;
}

//listen for request on port 3000
app.listen(3000);
console.log("App listening on port 3000");
