var express = require('express');
var mysql = require('mysql');
var application = require('../app.js');

var router = express.Router();

/* GET the mulpiplier */
router.get('/', function(req, res, next) {
    var catr = req.query.catr;
    var meteo = req.query.meteo;
    getMultiplierStrAndSend(catr,meteo,res);
});

// this function calculates the multiplier and sends the response in json format
function getMultiplierStrAndSend(catr,meteo,res) {
    var multiplierObject = {"multiplier":"unknown","contributions":{"catrMultiplier":"unknown","meteoMultiplier":"unknown"}};
    if (catr != null && isCorrectCatrCode(catr)) {
        console.log("catr valid");
        var sqlAccForCatrQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `catr` FROM `lieu` WHERE `catr` = " + catr;
        var sqlKmForCatrQueryStr = "SELECT (`km`) FROM route WHERE `routeCode` = " + catr;

        // use the connection to query the DB for accidents, then for km
        // TODO: do this asynchroneously using Promise.all()
        application.con.query(sqlAccForCatrQueryStr, function (err, result1, fields) {
            if (err) throw err;
            application.con.query(sqlKmForCatrQueryStr, function (err, result2, fields) {
                if (err) throw err;
                var catrMultiplier = getMultiplierForCatr(result1[0].nb_accidents,result2[0].km);
                //jsonRes = jsonRes + "{\"catrMultiplier \" : " + catrMultiplier;
                multiplierObject.contributions.catrMultiplier = catrMultiplier;
                if (meteo != null && isCorrectMeteoCode(meteo)) {
                    console.log("meteo valid");
                    var sqlAccForMeteoQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `atm` FROM `cara` WHERE `atm` =" + meteo;
                    var sqlKmForMeteoQueryStr = "SELECT (`km`) FROM meteo WHERE `meteoCode` = " + meteo;
                    application.con.query(sqlAccForMeteoQueryStr, function (err, result3, fields) {
                        if (err) throw err;
                        application.con.query(sqlKmForMeteoQueryStr, function (err, result4, fields) {
                            if (err) throw err;
                            var meteoMultiplier = getMultiplierForMeteo(result3[0].nb_accidents,result4[0].km);
                            multiplierObject.contributions.meteoMultiplier = meteoMultiplier;
                            var globalMultiplier = meteoMultiplier*catrMultiplier;
                            multiplierObject.multiplier = globalMultiplier;
                            res.send(JSON.stringify(multiplierObject));
                        });
                    });
                }
                // no meteo
                else {
                    multiplierObject.contributions.meteoMultiplier = "invalid";
                    multiplierObject.multiplier = catrMultiplier;
                    res.send(JSON.stringify(multiplierObject));
                }
            });
        });
    }
    // No valid catr
    else {
        if (meteo != null && isCorrectMeteoCode(meteo)) {
            console.log("meteo valid");
            var sqlAccForMeteoQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `atm` FROM `cara` WHERE `atm` =" + meteo;
            var sqlKmForMeteoQueryStr = "SELECT (`km`) FROM meteo WHERE `meteoCode` = " + meteo;
            application.con.query(sqlAccForMeteoQueryStr, function (err, result3, fields) {
                if (err) throw err;
                application.con.query(sqlKmForMeteoQueryStr, function (err, result4, fields) {
                    if (err) throw err;
                    var meteoMultiplier = getMultiplierForMeteo(result3[0].nb_accidents,result4[0].km);
                    multiplierObject.contributions.meteoMultiplier = meteoMultiplier;
                    var globalMultiplier = meteoMultiplier;
                    multiplierObject.multiplier = globalMultiplier;
                    res.send(JSON.stringify(multiplierObject));
                });
            });
        }
    }
  }
  
  // this function calculates and return the numerical risk multiplier for route category
  function getMultiplierForCatr(accidentNumber, numberKm) {
      var multiplier = "unknown";
      if ( application.cache.nbAccTotal != null && numberKm != null)
        multiplier = (accidentNumber / application.cache.nbAccTotal) * (application.cache.nbKmCatrTotal / numberKm);
      return multiplier;
  }

  // this function calculates and return the numerical risk multiplier for meteo conditions
  function getMultiplierForMeteo(accidentNumber, numberKm) {
        var multiplier = "unknown";
        if ( application.cache.nbAccTotal != null && numberKm != null)
            var multiplier = (accidentNumber / application.cache.nbAccTotal) * (application.cache.nbKmMeteoTotal / numberKm);
        return multiplier;
  }

  function isCorrectCatrCode(catrCode) {
    if ( isInt(catrCode) && 0 < catrCode && catrCode < 6 ) {
        console.log("valid catr code");
        return true;
    }      
    else
      return false;
  }
  
  function isCorrectMeteoCode(meteoCode) {
    if ( isInt(meteoCode) && 0 < meteoCode && meteoCode < 9 )
      return true;
    else
      return false;
  }

  function isInt(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
  }

module.exports = router;