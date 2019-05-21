
function getMultiplicateurFromServices() {
    // first let's ask OSM
    var selectCatr = document.getElementById("road");
    var catrSelection = selectCatr.options[selectCatr.selectedIndex].value;
    if ( catrSelection == 0) {
        var url = createOsmURL();
        fetch(url)
        .then(status)
        .then(json)
        .then(function(data) {
            var roadDetailsStr = findRoadDetails(data);
            var catrCode = getCatrCode(roadDetailsStr);
            // then let's ask OWM, passing it OSM response for convenience
            getOWMData(catrCode);
            //document.getElementById("Montexte").innerHTML = roadDetailsStr;
        }).catch(function(error) {
            console.log('Request failed', error);
        });
    }
    else {
        getOWMData(catrSelection);
    }
}
function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}
function json(response) {
  return response.json()
}
function createOsmURL(){
  var opQuery= buildOverpassQuery();
  var baseURL = "https://lz4.overpass-api.de/api/interpreter";
  var query = '?data=[out:json][timeout:15];(' + opQuery + ');out;';
  var finalURL = baseURL + query;
  return finalURL;
}

function buildOverpassQuery() {
	var lat = document.getElementById("lat").value;
  	var lon = document.getElementById("lon").value;
  	var qLQuery = "way(around:5," + lat + "," + lon + ")[\"highway\"!~\"path|track|cycleway|footway\"];(._;>;);";
    return qLQuery;
}

function findRoadDetails(data) {
	var elementsArray = data.elements;
	for (var i in elementsArray) {
		var element = elementsArray[i];
		if ( element.type == "way") {
			return element.tags.highway;
		}
	}
	return "pas de route trouvee";
}

function getOWMData(roadDetailsStr) {
  var meteoSelectElement = document.getElementById("weather");
  var meteoSelection = meteoSelectElement.options[meteoSelectElement.selectedIndex].value;
  if (meteoSelection != 0) {
    var myMult = getMultiplier(roadDetailsStr,meteoSelection);
  }
  else {
    var myPos = navigator.geolocation.getCurrentPosition;
    var url;
    if (myPos.coords)
        url = "http://api.openweathermap.org/data/2.5/weather?lat="+myPos.coords.latitude+"&lon"+myPos.coords.longitude+"&appid=619926166e0fec5599764d969162ab1f";
    else
        url = "http://api.openweathermap.org/data/2.5/weather?q=Avignon&appid=619926166e0fec5599764d969162ab1f";

    fetch(url)
    .then(status)
    .then(json)
    .then(function(data) {
        var weatherID =  data.weather[0].id;
        var weatherCode = null;
        if ( weatherID < 200)
            weatherCode = weatherID;
        else
            var weatherCode = getWeatherCode(weatherID);
        var multiplier = getMultiplier(roadDetailsStr,weatherCode);
    }).catch(function(error) {
        console.log('Request failed', error);
  });
}
}

function getMultiplier(catrCode,weatherCode) {
    var multiplierServiceUrl = "http://nat-srvperso-referjpm.univ-avignon.fr:8095/multiplier?catr="+catrCode+"&meteo="+weatherCode;
    fetch(multiplierServiceUrl/*, {mode:'no-cors'}*/)
    .then(status)
    .then(json)
    .then(function(data) {
        var multiplier =  data.multiplier;
        document.getElementById("multiplicateur").innerHTML = multiplier;
        var backGroundColor = "green";
        if ( multiplier < 1.5 )
            backGroundColor = "green";
        else if (multiplier < 3)
            backGroundColor = "orange";
        else
            backGroundColor = "red";
        document.getElementById("circle").innerHTML = Math.round(multiplier*10)/10;
        document.getElementById("circle").style.backgroundColor=backGroundColor;
    }).catch(function(error) {
        document.getElementById("multiplicateur").innerHTML = "Le service ne repond pas :-(";
        console.log('Request failed', error);
  });
}

function getWeatherCode(codeID) {
    switch (codeID) {
        case  200: 
            return 2;
        case  201:
            return 2;
        case  202:
            return 3;
        case  210:
            return 8;
        case  211:
            return 8;
        case  212:
            return 8;
        case  221:
            return 8;
        case  230:
            return 2;
        case  231:
            return 2;
        case  232:
            return 3;
        case  300:
            return 2;
        case  301:
            return 2;
        case  302:
            return 5;
        case  310:
            return 2;
        case  311:
            return 2;
        case  312:
            return 3;
        case  313:
            return 2;
        case  314:
            return 2;
        case  321:
            return 2;
        case  500:
            return 2;
        case  501:
            return 2;
        case  502:
            return 3;
        case  503:
            return 3;
        case  504:
            return 3;
        case  511:
            return 4;
        case  520:
            return 2;
        case  521:
            return 2;
        case  522:
            return 3;
        case  531:
            return 3;
        case  600:
            return 4;
        case  601:
            return 4;
        case  602:
            return 4;
        case  611:
            return 4;
        case  612:
            return 4;
        case  615:
            return 4;
        case  616:
            return 4;
        case  620:
            return 4;
        case  621:
            return 4;
        case  622:
            return 4;
        case  701:
            return 5;
        case  711:
            return 5;
        case  721:
            return 5;
        case  731:
            return 9;
        case  741:
            return 5;
        case  751:
            return 5;
        case  761:
            return 5;
        case  762:
            return 9;
        case  771:
            return 6;
        case  781:
            return 6;
        case  800:
            return 1;
        case  801:
            return 1;
        case  802:
            return 1;
        case  803:
            return 8;
        case  804:
            return 8;
        default:
            return 5;
    }
}

  function getCatrCode(osmLabel) {
    switch ( osmLabel) {
        case  "motorway" :
            return 1;
        case  "trunk" :
            return 1;
        case  "primary" :
            return 2;
        case  "secondary" :
            return 3;
        case  "tertiary" :
            return 3;
        case  "unclassified" :
            return 5;
        case  "residential" :
            return 4;
        case  "living_street" :
            return 4;
        case  "service" :
            return 6;
        case  "track" :
            return 9;
        case  "pedestrian" :
            return 9;
        case  "motorway_link" :
            return 1;
        case  "trunk_link" :
            return 1;
        case  "primary_link" :
            return 2;
        case  "secondary_link" :
            return 3;
        case  "tertiary_link" :
            return 3;
        default : 
            return 2;
    }
  }


