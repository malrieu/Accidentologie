function getOWMData() {
  var x = $('#fname').val();
  var url = "http://api.openweathermap.org/data/2.5/weather?q="+x+"&appid=619926166e0fec5599764d969162ab1f";
  $.get(url, function(data) {
    var jData = JSON.parse(data);
    var owmId = jData.weather[0].id;
    var url = "/" + owmId + "/correspondances";
    $.get(url, function(data_bdd){
      $('#Montexte').append(data_bdd);

    }).fail(function() {
      console.log('Request failed', error);
    });
  }).fail(function() {
    console.log('Request failed', error);
  });

 /*fetch(url)
  .then(status)
  .then(json)
  .then(function(data) {
    var owmId = data.weather[0].id;
    var url = "/" + owmId + "/correspondances";
    fetch(url)
     .then(status)
     .then(json)
     .then(function(data) {
       document.getElementById("Montexte").innerHTML = data.weather[0].description;
     }).catch(function(error) {
       console.log('Request failed', error);
     });
  }).catch(function(error) {
    console.log('Request failed', error);
  });*/
  $('#Montexte').append(x);
  // document.getElementById("Montexte").innerHTML = x;
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