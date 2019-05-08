var fs = require('fs');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Projet tutoré Accidentologie' });
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// route correspondance code api -> code bdd
router.get('/correspondance', function(req, res) {
  var correspondances = JSON.parse(fs.readFileSync('associations.json'));
  var apiId = req.query.id;
  var bddLabel = correspondances[apiId]["label-bdac"];
  res.send(bddLabel);
});

module.exports = router;
