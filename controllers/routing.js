var express = require('express'),
    router  = express.Router(),
    morgan  = require('morgan');

router.get('/', function(req, res) {
    res.redirect('/view');
})

router.get('/edit', function(req, res) {
    res.render('edit.html');
})

router.get('/view', function(req, res) {
    res.render('view.html');
})

module.exports = router;