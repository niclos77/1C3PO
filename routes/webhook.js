var config = require('config'),
    request = require('request');

var express = require('express');
var router = express.Router();

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

/* GET Validation FB Token */
router.get('/webhook', function(req, res) {
    console.log("hub.mode="+ req.query['hub.mode'])
    console.log("hub.verify_token="+ req.query['hub.verify_token'])
    if (req.query['hub.mode'] === 'subscribe' &&
        // req.query['hub.verify_token'] === "bNr6I3KWSH7220q4398Od8IBeX2owLF2") {
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

/* POST Validation FB Token */
router.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.message) {
                    receivedMessage(event, req);
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


/* GET admin page. */
router.get('/admin', function(req, res, next) {
  var messages = req.app.get('messages');
  var modeBot = req.app.get('modeBot');
  var users = [];
  // console.log('GET /admin');
  // console.log(messages);

  var promiseTab = [];

  for (i in Object.keys(messages)) {
    // console.log('i = '+i);
    // console.log(messages[i]);
    var userID = Object.keys(messages)[i];

    var lastConnectionTimestamp = messages[userID][messages[userID].length-1].time;
    var lastConnDate = new Date(lastConnectionTimestamp);
    var month = lastConnDate.getMonth() + 1;
    var lastConnection = lastConnDate.getFullYear()+'-'+month+'-'+lastConnDate.getDate()+' '+lastConnDate.getHours()+':'+lastConnDate.getMinutes();


    var userObj = {
      userID: userID,
      lastConnection: lastConnection,
      allMessages: messages[userID]
    }

    promiseTab.push(getUserInfo(userObj))
  }

  Promise.all(promiseTab)
  .then(function (users) {
    console.log('All users received : ');
    console.dir(users);
    res.render('admin', {users: users, modeBot: modeBot});
  })
  .catch(function (error) {console.error(error);})
  console.log('GET /admin render :');
});



//************************* FONCTIONS *******************************


function receivedMessage(event, req) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
    var modeBot = req.app.get('modeBot');

    saveMessage(senderID, timeOfMessage, message, req);

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText&&!modeBot) {
      var reponse = messageText;

      if ( (messageText.toUpperCase()).includes('TOTO')) {
        reponse = `Alors... \nC'est Toto qui va à la pharmacie et... \nBref, tu la connais !`
      }
      reponse = `Hello ! Merci pour ton message. Malheureusement, personne n'est disponible pour te répondre maintenant. Nous reviendrons vers toi demain matin ! En attendant, tu peux peut être me donner ton numéro de téléphone, comme ça je t'appelle direct !
A plus !`;
      sendTextMessage(senderID, reponse);
    }
}

function saveMessage(senderID, timeOfMessage, message, req) {
    var messages = req.app.get('messages');

    // Fonction appelée pour sauvegarder les données identité/date/message de la conversation, pour chaque senderID
    console.log("entrée dans saveMessage");
    if(messages[senderID]) {
      console.log("entrée dans le if savemessage");
      messages[senderID].push({time:timeOfMessage, message:message});
    } else {
      console.log("entrée dans le else savemessage");
      messages[senderID]=[];
      messages[senderID].push({time:timeOfMessage, message:message});
    }
    console.log('longueur du tableau message : ' + messages[senderID].length);
    console.log(messages);
}


function sendGenericMessage(recipientId, messageText) {
    // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
    console.log("Entrée dans sendTextMessage");
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    console.log("Objet retourné = "+JSON.stringify(messageData));
    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        // qs: { access_token: "EAAEZAn1aPlp0BAPMlsZBBiju10ZCqcCRH34jgWg3NUt11OCyEimwabauCgBH5Kv2584ByhvBq9ExpR5L8FMApU6lKezIHMcc4VhsRwDgr0K3kzhMmtoYro9DkHz9jZABTwdAhYsWViOY884yr9AiMxOV3dL8C70GCDz4agaqlgZDZD" },
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

/* Récuperer les infos utilisateurs à afficher dans le tableau ADMIN */
function getUserInfo(userObj) {
  return new Promise ((resolve, reject) => {
    request({
      uri: 'https://graph.facebook.com/v2.6/'+userObj.userID,
      // qs: { access_token: "EAAEZAn1aPlp0BAPMlsZBBiju10ZCqcCRH34jgWg3NUt11OCyEimwabauCgBH5Kv2584ByhvBq9ExpR5L8FMApU6lKezIHMcc4VhsRwDgr0K3kzhMmtoYro9DkHz9jZABTwdAhYsWViOY884yr9AiMxOV3dL8C70GCDz4agaqlgZDZD" },
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'GET'

    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('Received infos for '+userObj.userID);
        var infos = JSON.parse(body);
        var hasInfo = false;

        if (infos.first_name) {
          userObj.prenom = infos.first_name;
          hasInfo = true;
        }
        if (infos.last_name) {
          userObj.nom = infos.last_name;
          hasInfo = true;
        }
        if (infos.profile_pic) {
          userObj.photo = infos.profile_pic;
          hasInfo = true;
        }
        if (infos.gender) {
          userObj.genre = infos.gender;
          hasInfo = true;
        }

        userObj.hasInfo = hasInfo;

        console.dir(userObj);
        resolve(userObj);
        // console.error(response);
      } else {
        reject(error);
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });
  })
}

module.exports = router;
