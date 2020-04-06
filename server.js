// Author: Jean-Philippe Beaudet @ S3R3NITY Technology 
//
// /server.js
// Version : 0.0.1
// License: GNU 3.0 General Public License
//
// =====================================================

// load the things we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');
var router = express.Router();

var server = require('http').createServer(app);
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(require('express-session')({
    secret: 'HODLsecret',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'data')));


// index page 
app.get('/', function(req, res) {
    res.render('pages/index');
});

// explorer tx page 
app.get('/tx/:txid', function(req, res) {
	var data = {txid: req.params.txid}
    res.render('pages/tx', data);
});

// explorer addresses page 
app.get('/address/:address', function(req, res) {
	var data = {address: req.params.address}
    res.render('pages/address', data);
});

// trade 
app.get('/trade', function(req, res) {
    res.redirect('dex/'+"0xc0a9ef5ced45ea39a2b6a4f19fcd78ceeded16ed");
});

// load trading platform for address
app.get('/dex/:address', function(req, res) {
	var data = {address: req.params.address}
    res.render('pages/trade',data);
});

//  support 
app.get('/support', function(req, res) {
    res.render('pages/support');
});

//start server
server.listen(8080);
console.log('server started on port: 8080');
