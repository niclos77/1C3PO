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
                    receivedMessage(event);
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

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {
      let reponse = messageText;

      if (messageText.toUpperCase().includes('TOTO')) {
        reponse = `Alors... \nC'est Toto qui va à la pharmacie et... \nBref, tu la connais !`
      }

      sendTextMessage(senderID, messageText);
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
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

module.exports = router;
