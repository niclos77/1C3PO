var express = require('express');
var router = express.Router();

const
  chatService = require('../server/chatService'),
  weatherService = require('../server/weatherService'),
  WeatherData = require('../server/model/weatherData'),
  userService = require('../server/userService'),
  parser = require('json-parser');

/* GET webhook auth. */
router.get('/', function(req, res, next) {
  if (chatService.authenticate(req)) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  };
});

/* POST route for receiving message */
router.post('/', function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var timeOfEvent = entry.time;
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          var senderId = event.sender.id;
          if (!userService.isUserKnown(senderId)) {
            userService.addUser(senderId, {
              id: senderId,
              createdAt: timeOfEvent,
              status: 'station'
            });
            chatService.sendTextMessage(senderId, 'Hello, my name is Shauny️️ nice to meet you ! \nI\'m here to help you to find the best spot ❄️️❄️️❄️️️ \nTo do so, send me a station name');
          } else {
            var user = userService.getUser(senderId);
            var message = event.message;
            switch(user.status) {
              case 'station':
                weatherService.getGeolocalisation(message.text)
                  .then(function (body) {
                    var response = parser.parse(body).results;
                    if (response.length <= 0) {
                      chatService.sendTextMessage(senderId, 'I don\'t find any city with this name 😢, can you verify the typo or try something else 🙂');
                    } else {
                      var location = response[0].geometry.location;
                      chatService.sendTextMessage(senderId, 'This the weather forecast for ' + message.text);
                      weatherService.getWeatherForecast(location.lat, location.lng)
                        .then(function (body) {
                            var weatherdata = new WeatherData(body);
                            var carousel = [];
                            weatherdata.forecast.forEach(function (forecast) {
                              carousel.push(
                                {
                                  title: forecast.display_date,
                                  subtitle: forecast.weather.description + '\n Max : ' + forecast.temp.max + '°C\n Min : ' + forecast.temp.min + '°C',
                                  image_url: forecast.weather.image,
                                  buttons: [{
                                    type: "web_url",
                                    url: "http://maps.google.com/maps?z=12&t=m&q=loc:" + location.lat + "+" + location.lng,
                                    title: "Open Google Map"
                                  }]
                                }
                              )
                            })
                            chatService.sendCarouselReply(senderId, carousel);
                        })
                        .catch(function (err) {
                          chatService.sendTextMessage(senderId, 'I don\'t have nay weather data for 😢, can you try something else 🙂');
                        })
                    }
                  })
                  .catch(function (err) {
                    console.log(err);
                    chatService.sendTextMessage(senderId, 'Internal error 🤒');
                  })
                break;
              default:
                chatService.sendTextMessage(senderId, 'Your status : ' + user.status);
            }
          }
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

module.exports = router;
