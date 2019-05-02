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
    var jsonRes = "{ \"multiplier\" : ";
    if (catr != null) {
        var sqlAccForCatrQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `catr` FROM `lieu` WHERE `catr` = " + catr;
        var sqlKmForCatrQueryStr = "SELECT (`km`) FROM route WHERE `routeCode` = " + catr;

        // use the connection to query the DB for accidents, then for km
        // TODO: do this asynchroneously using Promise.all()
        application.con.query(sqlAccForCatrQueryStr, function (err, result1, fields) {
            if (err) throw err;
            application.con.query(sqlKmForCatrQueryStr, function (err, result2, fields) {
                if (err) throw err;
                var catrMultiplier = getMultiplierForCatr(result1[0].nb_accidents,result2[0].km);
                console.log("catrMultiplier = " + catrMultiplier);
                if (meteo != null) {
                    var sqlAccForMeteoQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `atm` FROM `cara` WHERE `atm` =" + meteo;
                    var sqlKmForMeteoQueryStr = "SELECT (`km`) FROM meteo WHERE `meteoCode` = " + meteo;
                    application.con.query(sqlAccForMeteoQueryStr, function (err, result3, fields) {
                        if (err) throw err;
                        application.con.query(sqlKmForMeteoQueryStr, function (err, result4, fields) {
                            if (err) throw err;
                            var meteoMultiplier = getMultiplierForMeteo(result3[0].nb_accidents,result4[0].km);
                            console.log("meteoMultiplier = " + meteoMultiplier);
                            var globalMultipier = meteoMultiplier*catrMultiplier;
                            console.log("GlobalMultiplier" + globalMultipier);
                            jsonRes = jsonRes + globalMultipier + "}";
                            res.send(jsonRes);
                        });
                    });
                }
                else {
                    jsonRes = jsonRes + catrMultiplier + "}";
                    res.send(jsonRes);
                }  
            });
        });
    }
    else {
        if (meteo != null) {
            var sqlAccForMeteoQueryStr = "SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `atm` FROM `cara` WHERE `atm` =" + meteo;
            var sqlKmForMeteoQueryStr = "SELECT (`km`) FROM meteo WHERE `meteoCode` = " + meteo;
    
            application.con.query(sqlAccForMeteoQueryStr, function (err, result1, fields) {
                if (err) throw err;
                console.log(result1);
                application.con.query(sqlKmForMeteoQueryStr, function (err, result2, fields) {
                    if (err) throw err;
                    console.log(result2);
                    var meteoMultiplier = getMultiplierForMeteo(result1[0].nb_accidents,result2[0].km);
                    jsonRes = jsonRes + meteoMultiplier + "}";
                    res.send(jsonRes);
                });
            });
        }
        else {
            jsonRes = jsonRes + "1}";
            res.send(jsonRes);
        }
    }
  }
  
  // this function calculates and return the numerical risk multiplier for route category
  function getMultiplierForCatr(accidentNumber, numberKm) {
      var multiplier = (accidentNumber / application.cache.nbAccTotal) * (application.cache.nbKmCatrTotal / numberKm);
      console.log("calcul:" + multiplier);
      return multiplier;
  }

  // this function calculates and return the numerical risk multiplier for meteo conditions
  function getMultiplierForMeteo(accidentNumber, numberKm) {
        var multiplier = (accidentNumber / application.cache.nbAccTotal) * (application.cache.nbKmMeteoTotal / numberKm);
        console.log("calcul:" + multiplier);
        return multiplier;
  }

module.exports = router;