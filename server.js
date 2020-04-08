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
var hodl = require("./src/hodl.js")
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
	var data = {title: "HODL Explorer", error: req.query.error}
	hodl.public(function(results){
		console.log(JSON.stringify(results))
		data.public = results
		res.render('pages/index', data);
	})   
});

// explorer tx page 
app.get('/tx/:txid', function(req, res) {
	var data = {txid: req.params.txid, title: "HODL Explorer | TX Details", error:null}
    res.render('pages/tx', data);
});

// explorer addresses page 
app.get('/address/:address', function(req, res) {
	var data = {title: "HODL Explorer | Address Details", error:null}
	try{
		hodl.byAddress(req.params.address, function(adddress_details, err){
			data.balanceOf = adddress_details.balanceOf ||0;
			data.poolBalanceOf = adddress_details.poolBalanceOf || 0;
			data.remainderBalanceOf = adddress_details.remainderBalanceOf ||0;
			data.remainderBalanceOfETH = adddress_details.remainderBalanceOfETH ||0;
			data.address = req.params.address
			data.balanceOfUSD = adddress_details.balanceOfUSD ||0;
			data.balanceOfETH = adddress_details.balanceOfETH ||0;
			hodl.public(function(results){
				data.public = results
				console.log(JSON.stringify(data))
				res.render('pages/address', data);
			})  
		})
		
	}catch(error){ 	
		res.redirect('/'+"?error= "+error);
	} 
});

// trade 
app.get('/trade', function(req, res) {
    res.redirect('dex/'+"0xc0a9ef5ced45ea39a2b6a4f19fcd78ceeded16ed");
});

// load trading platform for address
app.get('/dex/:address', function(req, res) {
	var data = {address: req.params.address, title: "HODL Trade | Buy & Sell", error:null}
	try{
		hodl.byAddress(req.params.address, function(adddress_details, err){
			data.balanceOf = adddress_details.balanceOf ||0;
			data.poolBalanceOf = adddress_details.poolBalanceOf || 0;
			data.remainderBalanceOf = adddress_details.remainderBalanceOf ||0;
			data.remainderBalanceOfETH = adddress_details.remainderBalanceOfETH ||0;
			data.address = req.params.address
			data.balanceOfUSD = adddress_details.balanceOfUSD ||0;
			data.balanceOfETH = adddress_details.balanceOfETH ||0;
			hodl.public(function(results){
				data.public = results
				console.log(JSON.stringify(data))
				res.render('pages/trade', data);
			})  
		})
		
	}catch(error){ 	
		data.error = error
		res.render('pages/trade', data);
	} 
});

//  support 
app.get('/support', function(req, res) {
	var data = {title: "HODL Support & Contribute", error:null}
	hodl.public(function(results){
		data.public = results
		res.render('pages/support', data);
	})
});

//start server
server.listen(8080);
console.log('server started on port: 8080');
