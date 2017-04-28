var express = require('express');
var router = express.Router();

/* Switch bot mode */
router.get('/switchMode', function(req, res, next) {
  var modeBot = req.app.get('modeBot');
  console.log('modeBot was '+modeBot);
  var newMode = !modeBot;
  req.app.set('modeBot', newMode);
  console.log('modeBot now is '+newMode);
  res.status(200).json(newMode);
})



module.exports = router;
