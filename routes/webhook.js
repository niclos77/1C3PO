/**
 * Created by theodo on 25/04/17.
 */
var express = require('express');
var router = express.Router();

/* GET Validation FB Token */
router.get('/webhook', function(req, res) {
    console.log("hub.mode="+ req.query['hub.mode'])
    console.log("hub.verify_token="+ req.query['hub.verify_token'])
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === "bNr6I3KWSH7220q4398Od8IBeX2owLF2") {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

module.exports = router;