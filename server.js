// Author: Jean-Philippe Beaudet  
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
	hodl.public(function(results){
		console.log(JSON.stringify(results))
		data.public = results
		res.render('pages/tx', data);
	})  
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
		var data = {title: "HODL | Synchronize Your Wallet", error:null}
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
		var data = {title: "HODL | Synchronize Your Wallet", error:null}
			hodl.public(function(results){
				data.public = results
				console.log(JSON.stringify(data))
				res.render('pages/syncWallet', data);
			})
    //res.redirect('dex/'+"0xc0a9ef5ced45ea39a2b6a4f19fcd78ceeded16ed");    
});
// trade 
app.post('/sync', function(req, res) {
		var data = {title: "HODL | Synchronize Your Wallet", error:null}
			var from = req.body.wallet
			console.log(from)
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

////////////////////////////
//// trade functions
////////////////////////////


///////////////
///// Sell section
////////////////////////////
// sell hodl
app.post('/sell', function(req, res) {
	var from = req.query.from
	var amount = req.body.amounts1
	if(from && amount){
		hodl.sell(from, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// sell hodl to bid
app.post('/sellToBid', function(req, res) {
	var from = req.query.from
	var to = req.body.addresss2
	var amount = req.body.amounts2
	if(from && to && amount){
		hodl.sellToBid(from, to, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// pre-approve transaction with address
app.post('/approveTransactionForAddress', function(req, res) {
	var from = req.query.from
	var to = req.body.addressb3
	var amount = req.body.amounts3
	if(from && to && amount){
		hodl.approveTransactionForAddress(from, to, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
///////////////
///// Buy section
////////////////////////////
// generic buy function, autobuy , buy from reserve or create a bid
app.post('/Buy', function(req, res) {
	var from = req.query.from
	var amount = req.body.amountb1
	if(from && amount){
		hodl.Buy(from, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// buy from reserve only
app.post('/buyFromReserve', function(req, res) {
	var from = req.query.from
	var amount = req.body.amountb2
	if(from && amount){
		hodl.buyFromReserve(from, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// buy from address
app.post('/buyFromAddress', function(req, res) {
	var from = req.query.from
	var to = req.body.addressb3
	var amount = req.body.amountb3
	if(from && amount){
		hodl.buyFromAddress(from, to, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// buy from ask
app.post('/buyFromAsk', function(req, res) {
	var from = req.query.from
	var to = req.body.addressb4
	var amount = req.body.amountb4
	if(from && amount){
		hodl.buyFromAddress(from, to, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});

///////////////
///// Pool section
////////////////////////////
// buy from pool
app.post('/buyFromPool', function(req, res) {
	var from = req.query.from
	var amount = req.body.amountp11
	if(from && amount){
		hodl.buyFromPool(from, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// sell hodl to current pool
app.post('/sellInPool', function(req, res) {
	var from = req.query.from
	var amount = req.body.amountp1
	if(from && amount){
		hodl.sellInPool(from, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
//  withdraw hodl from the pool
app.post('/removeTokensFromPool', function(req, res) {
	var from = req.query.from
	var amount = req.body.amountp2
	if(from && amount){
		hodl.removeTokensFromPool(from, amount, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
//  withdraw ethereum from the pool
app.post('/withdrawEthFromPoolSale', function(req, res) {
	var from = req.query.from
	if(from){
		hodl.withdrawEthFromPoolSale(from, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
//  withdraw ethereum 
app.post('/withdrawRemainderEthereum', function(req, res) {
	var from = req.query.from
	if(from){
		hodl.withdrawRemainderEthereum(from, function(results, error){
			if (error){
				res.redirect('dex/'+from+"?error="+error)
			}else{	
				res.redirect('dex/'+from)
			}
		})
	}else{
		res.redirect("/?error=bad url parameter")
	}
});
// error handler for bad request
app.get('*', function(req, res){
	var error = "Requested page does not exists"
	res.redirect('/'+"?error= "+error);
});

//start server
server.listen(8080);
console.log('server started on port: 8080');
