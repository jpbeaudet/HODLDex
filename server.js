// Author: Jean-Philippe Beaudet  
//
// /server.js
// Version : 01.0
// License: GNU 3.0 General Public License
//
// =====================================================

// load the things we need
var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');
var router = express.Router();
var hodl = require("./src/hodl.js")
var https = require('https');
var fs = require('fs');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app)
var server = require('http').createServer(app);

var browserify = require('browserify-middleware');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
 
app.use(require('express-session')({
  secret: 'This is a secret',
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'data')));

app.enable('trust proxy');
//provide a browserified file at a path
app.use (function (req, res, next) {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});
app.get('/js/bundle.js', browserify(__dirname + '/src/index.js'));

// index page 
app.get('/', function(req, res) {
	var error = req.query.error
	var msg = req.query.msg
	var data = {title: "HODL Explorer", error: error, msg: msg}
	hodl.public(function(results){
		console.log(JSON.stringify(results))
		data.public = results
		res.render('pages/index', data);
	})   
});

// explorer tx page 
app.get('/tx/:txid', function(req, res) {
	var error = req.query.error
	var msg = req.query.msg
	var data = {txid: req.params.txid, title: "HODL Explorer | TX Details", error:error, msg:msg}
	hodl.public(function(results){
		console.log(JSON.stringify(results))
		data.public = results
		res.render('pages/tx', data);
	})  
});

// explorer addresses page 
app.get('/address/:address', function(req, res) {
	var error = req.query.error
	var msg = req.query.msg
	var data = {title: "HODL Explorer | Address Details", error:error, msg: msg}
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
	var error = req.query.error
	var msg = req.query.msg
		var data = {title: "HODL | Synchronize Your Wallet", error:error,msg:msg}
			hodl.public(function(results){
				data.public = results
				console.log(JSON.stringify(data))
				if( req.session.wallet){
					res.redirect('dex/'+req.session.wallet);
				}else{
					res.render('pages/syncWallet', data);
				}
			})
    //res.redirect('dex/'+"0xc0a9ef5ced45ea39a2b6a4f19fcd78ceeded16ed");    
});
// trade 
app.get('/syncNew', function(req, res) {
	var error = req.query.error
	var msg = req.query.msg
		var data = {title: "HODL | Synchronize Your Wallet", error:error, msg: msg}
			hodl.public(function(results){
				data.public = results
				console.log(JSON.stringify(data))
				res.render('pages/syncWallet', data);
			})
    //res.redirect('dex/'+"0xc0a9ef5ced45ea39a2b6a4f19fcd78ceeded16ed");    
});
// trade 
app.post('/sync', function(req, res) {
	var error = req.query.error
	var msg = req.query.msg
		var data = {title: "HODL | Synchronize Your Wallet", error:error, msg:msg}
			var from = req.body.wallet
			console.log(from)
			hodl.getAddr(from, function(addr, error){
				if (error){
					res.redirect('/'+"?error= "+error);
				}else{		
					req.session.wallet =  req.body.wallet		
					hodl.public(function(results){
						data.public = results
						console.log(JSON.stringify(data))
						if( from){
							res.redirect('dex/'+from);
						}else{
							res.render('pages/syncWallet', data);
						}
					})
				}
			})
    //res.redirect('dex/'+"0xc0a9ef5ced45ea39a2b6a4f19fcd78ceeded16ed");    
});
// search 
app.post('/search', function(req, res) {
	try{
		hodl.getTx(req.body.search, function(tx, err){
			if (err){
				hodl.getAddr(req.body.search, function(addr, error){
					if (error){
						res.redirect('/'+"?error= "+error);
					}else{
						res.redirect('address/'+req.body.search);
					}
				})
			}else{			
				res.redirect('tx/'+req.body.search);
			}
		})
		
	}catch(error){ 	
		//res.redirect('/'+"?error= "+error);
	} 
    
});

// load trading platform for address
app.get('/dex/:address', function(req, res) {
	var error = req.query.error
	var msg = req.query.msg
	var data = {address: req.params.address, title: "HODL Trade | Buy & Sell", error:error, msg:msg}
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
	var error = req.query.error
	var msg = req.query.msg
	var data = {title: "HODL Support & Contribute", error:error, msg:msg }
	hodl.public(function(results){
		data.public = results
		res.render('pages/support', data);
	})
});

// error handler for bad request
app.get('*', function(req, res){
	var error = "Requested page does not exists"
	res.redirect('/'+"?error= "+error);
});

//start server
server.listen(80);
httpsServer.listen(443)
console.log('server started on port: 80');
console.log('https server started on port: 443');
