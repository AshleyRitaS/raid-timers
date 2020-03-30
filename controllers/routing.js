var express = require('express'),
    router  = express.Router(),
    morgan  = require('morgan');

router.get('/', function(req, res) {
    res.send('routing.js, test change 19:12');
})

router.get('/edit', function(req, res) {
    res.render('edit.html');
})

module.exports = router;