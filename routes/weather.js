var express = require('express');
var router = express.Router();

const
  weatherService = require('../server/weatherService'),
  parser = require('json-parser'),
  WeatherData = require('../server/model/weatherData');

/* GET weather page. */
router.get('/', function(req, res, next) {
  weatherService.getGeolocalisation('Grenoble')
    .then(function (body) {
      var location = parser.parse(body).results[0].geometry.location;
      weatherService.getWeatherForecast(location.lat, location.lng)
        .then(function (body) {
          var weatherData = new WeatherData(body);
          res.send(weatherData);
        });
    })
    .catch(function (err) {
    })
  ;
});

module.exports = router;
