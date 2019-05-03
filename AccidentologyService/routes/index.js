var fs = require('fs');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Projet tutoré Accidentologie' });
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/javascripts/correspondance.js', function(req, res){
  res.sendFile(path.join(__dirname + '/public/javascripts/correspondance.js'));
});

// route correspondance code api -> code bdd
router.get('/p?id/correspondance', function(req, res) {
  var correspondances = JSON.parse(fs.readFileSync('Association_code_OWM_DB.json'));
  var apiId = req.route.query.id;
  var bddLabel = correspondances[apiId]["label-bdac"];
  res.send(bddLabel);
});

module.exports = router;
