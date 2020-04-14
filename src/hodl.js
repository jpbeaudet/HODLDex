/*
 * author : Jean-Philippe Beaudet
 * jpbeaudet@vsekur.com
 * License GNU 3.0
 * Infuria project ID :
* 94841089cf24457ebaab3d909f3558d6
*/

var Web3 = require('web3');
var solc = require("solc");
var fs = require('fs');
///////////////////////////////////////
/////Goin Gecko
///// eth id=0xethereum-token
////  market_data.current_price
///////////////////////////////////////
//1. Import coingecko-api
const CoinGecko = require('coingecko-api');

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();
//3. Make calls
var ethPrice = 
console.log("POwered by Coin Gecko ")
/////////////////////////////////////
////web3
// Connect to a Infuria server over JSON-RPC
var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/94841089cf24457ebaab3d909f3558d6"));
var input = {
  language: 'Solidity',
  sources: {
    'hodl': {
      content: fs.readFileSync('./src/hodl/hodl.sol','UTF-8')
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};
console.log("Powered by Infuria");

var output = JSON.parse(solc.compile(JSON.stringify(input)));
var abiArray = output.contracts['hodl']["HODL"].abi;
var address = "0x34642A469e096138531E6396C50D2d416d0B47D7"
// Create a proxy object to access the smart contract
var MyContract = new web3.eth.Contract(abiArray);
MyContract.options.address = address

function isInstalled() {
   if (typeof web3 !== 'undefined'){
      console.log('MetaMask is installed')
   } 
   else{
      console.log('MetaMask is not installed')
   }
}
isInstalled()
function isLocked() {
   web3.eth.getAccounts(function(err, accounts){
      if (err != null) {
         console.log(err)
      }
      else if (accounts.length === 0) {
         console.log('MetaMask is locked')
        
      }
      else {
         console.log('MetaMask is unlocked')
      }
   });
}
isLocked()
function commafy( num ) {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1');
    }
    return str.join('.');
}

  
module.exports = {
    public: function(cb){
		var results = {}
		let promise = new Promise((resolve, reject) => {
			setTimeout(() => resolve("done!"), 250)
		});		
		let promise_getPastEvents = new Promise((resolve, reject) => {
			MyContract.getPastEvents('allEvents', {fromBlock: 0, toBlock: 'latest'}, function(e,l){			
				//console.log(l)
				results.events= l
				for (i = 0; i < l.length; i++) {
					results.timestamp=[]
					web3.eth.getBlock(results.events[i].blockNumber, (error, block) => {
						var date = new Date(block.timestamp*1000).toUTCString()
						results.timestamp.push(date);
						//console.log(block.timestamp)
						
						// here you go
					});
				}
				resolve("ok")
			})
		});			
		let promise_getPastEvents_pool = new Promise((resolve, reject) => {
			MyContract.getPastEvents('BoughtPool', {fromBlock: 0, toBlock: 'latest'}, function(e2,l2){			
				//console.log(l)
				results.poolIndex= l2.length			
				var count =   results.poolIndex								
				MyContract.methods.getTokenBalanceOfPool(count).call( async(error, result2)=>{
					if(error){
						console.log("hodl: "+error)
						return cb(null, error)
					}
					results.getTokenBalanceOfPool =  result2
					resolve("ok")
										
					})	
				})
		})
		let promise_totalSupply = new Promise((resolve, reject) => {		 
		// nesting async call to ensure a unified results{} return value
			MyContract.methods.totalSupply().call( async(error, result)=>{

				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.totalSupply = result
				results.totalSupplyComma = commafy(result/(10**10))
						resolve("ok")
				//end of total supply
				//Goin Gecko	
				})
		})
		let promise_reserveBalance = new Promise((resolve, reject) => {			
			MyContract.methods.reserveBalance().call( async(error, result)=>{	
				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.reserveBalance = commafy( (result / (10**10)).toFixed(10)	)			
				resolve("ok")
				})
		})
			//end of reserveBalance
		let promise_getContractAddress = new Promise((resolve, reject) => {	
			MyContract.methods.getContractAddress().call( async(error, result)=>{	
				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.getContractAddress =  result				
				resolve("ok")		
			})
		})
		//end of getContractAddress
		let promise_txnb = new Promise((resolve, reject) => {

			MyContract.methods.txnb().call( async(error, result)=>{	
				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.txnb =  result				
				resolve("ok")
			})
		})
		//end of txnb
		let promise_getAsks = new Promise((resolve, reject) => {
			MyContract.methods.getAsks().call( async(error, result)=>{	
				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.getAsks ={}
				results.getAsks.address =  result["0"]	
				results.getAsks.amount=  result["1"]
				resolve("ok")					
			})
		})
		//end of getAsks
		let promise_getBids = new Promise((resolve, reject) => {
			MyContract.methods.getBids().call( async(error, result)=>{	
				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.getBids ={}
				results.getBids.address = result["0"]	
				results.getBids.amount= result["1"]	
				resolve("ok")		
			})
		})
		//end of getBids
		let promise_currentPriceUSDCent = new Promise((resolve, reject) => {
			MyContract.methods.currentPriceUSDCent().call( async(error, result)=>{	
				if(error){
					return ("Err:"+error)
				}
				let ethPrice = async(res) => {
					//let data = await CoinGeckoClient.coins.list();
					let data = await CoinGeckoClient.coins.fetch('ethereum', {}).then((data) =>{
						results.ethPrice = {
							USD: data.data.market_data.current_price.usd,
							EUR: data.data.market_data.current_price.eur,
							CAD: data.data.market_data.current_price.cad,
							BTC: data.data.market_data.current_price.btc,
							LTC: data.data.market_data.current_price.ltc,
							EOS: data.data.market_data.current_price.eos
						}																				
						results.getPriceOf = commafy((((res/10000)*((10**18)/(data.data.market_data.current_price.usd*10000)))/(10**14)).toFixed(9))
						results.getPriceOfWei = commafy(Math.floor( (((res)*((10**18)/(data.data.market_data.current_price.usd*10000))))))
						// leave that to explore as a LOT of data is avalable in there
						//console.log("data ", JSON.stringify(data.data.market_data.current_price))
						results.currentPriceUSDCent = res/10000				
						results.priceIncreasePerCent = ((res/100) / 0.01)*100
						results.marketcap = commafy( ((results.totalSupply/(10**10))* results.currentPriceUSDCent).toFixed(2))
						resolve("ok")
						})	
					};
					ethp = ethPrice(result)
					await promise							 
			})
		})
		//end of currentPriceUSDCent
		let promise_getPriceOf = new Promise((resolve, reject) => {
			MyContract.methods.getPriceOf(1).call( async(error, result)=>{	
				if(error){
					console.log("hodl: "+error)
					return ("Err:"+error)
				}
				results.getPriceOfPaid = (result	/ (10**8)).toFixed(9)
				resolve("ok")
			})
		})
		//end of getCurrentUSDCent
		var start = promise_getPriceOf.then(async()=>{							
										//wait for results
										await promise_getPastEvents
									})
									.then(async()=>{
										//wait for results
										await promise_getPastEvents_pool
									})	
									.then(async()=>{
										//wait for results
										await promise_totalSupply
									})	
									.then(async()=>{
										//wait for results
										await promise_reserveBalance
									})	
									.then(async()=>{
										//wait for results
										await promise_getContractAddress
									})	
									.then(async()=>{
										//wait for results
										await promise_txnb
									})
									.then(async()=>{
										//wait for results
										await promise_getAsks
									})
									.then(async()=>{
										//wait for results
										await promise_getBids
									})
									.then(async()=>{
										//wait for results
										await promise_currentPriceUSDCent
									})
									//.then(async()=>{
										//wait for results
										//await promise_getPriceOf
									//})							
									.then(async()=>{
										//wait for results
										return cb(results)
									})		 	
	},		
    byAddress: function(address, cb){
		let promise = new Promise((resolve, reject) => {
			setTimeout(() => resolve("done!"), 1000)
		});		
		var results = {}

		// nesting async call to ensure a unified results{} return value
		MyContract.methods.balanceOf(address).call( async(error, result)=>{
			if(error){
				return cb(null, error)
			}
			results.balanceOf =  commafy(result/ (10**10))
			var balOf = result/ (10**10)
			var priceOf1;
			MyContract.methods.getPriceOf(1).call( async(error, result)=>{	
				if(error){
					return cb(null, error)
				}
				results.balanceOfETH = commafy((((balOf*(10**10)) * result)/(10**18)).toFixed(9))
			})
			MyContract.methods.currentPriceUSDCent().call( async(error, result)=>{	
				if(error){
					return cb(null, error)
				}
				results.balanceOfUSD =   "$"+commafy((balOf * (result/10000)).toFixed(2))
			})
				// nesting async call to ensure a unified results{} return value
				MyContract.methods.remainderBalanceOf(address).call( async(error, result)=>{
					if(error){
						return cb(null, error)
					}
					results.remainderBalanceOf =  result
					results.remainderBalanceOfETH =  (result / (10**18)).toFixed(18)	
				})
				MyContract.getPastEvents('BoughtPool', {fromBlock: 0, toBlock: 'latest'}, function(e2,l2){			
					var count =  l2.length
						
						
				MyContract.methods.poolBalanceOf(address).call( async(error, result2)=>{
					if(error){
						return cb(null, error)
					}
					results.poolBalanceOf =  result2[count]
						
				})	
				})
				.then(async()=>{
					//wait for results
					await promise
					return cb(results, null)
				})
		})	// end of nesting
	},
	getTx : function(query, cb){
		web3.eth.getTransaction(query, function(error,tx){
			if (error){
				return cb(null, error)
			}
			return cb(tx, null)
		})	
	},
	getAddr : function(query, cb){
			try{
		web3.eth.getBalance(query, function(error,addr){
			if (error){
				return cb(null, error)
			}
			return cb(addr, null)
		})
		}catch(error){ 	
			return cb(null, error)
		} 	
	},
	// sell section
	sell : function(from, amount, cb){
		MyContract.methods.sell(amount).call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	sellToBid : function(from, to, amount, cb){
		MyContract.methods.sellToBid(to, amount).call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	// buy section
	Buy : function(from, amount, cb){
		MyContract.methods.Buy().call({from: from, value: amount}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	buyFromReserve : function(from, amount, cb){
		MyContract.methods.buyFromReserve().call({from: from, value: amount}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	buyFromAddress : function(from, to, amount, cb){
		MyContract.methods.buyFromAddress(to).call({from: from, value: amount}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	buyFromAsk : function(from, to, amount, cb){
		MyContract.methods.buyFromAsk(to).call({from: from, value: amount}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	// pool section
	buyFromPool : function(from, to, amount, cb){
		MyContract.methods.buyFromPool().call({from: from, value: amount}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	sellInPool : function(from, amount, cb){
		MyContract.methods.sellTInPool(amount).call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	removeTokensFromPool : function(from, amount, cb){
		MyContract.methods.removeTokensFromPool(amount).call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	withdrawEthFromPoolSale : function(from, cb){
		MyContract.methods.removeTokensFromPool().call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	withdrawRemainderEthereum : function(from, cb){
		MyContract.methods.withdrawRemainderEthereum().call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	approveTransactionForAddress : function(from, to, amount, cb){
		MyContract.methods.approveTransactionForAddress(to, amount).call({from: from}, async(error, result)=>{
			if(error){
				return cb(null, error)
			}else{
				return cb(result, null)
			}
		})			
		
	},
	getBalance: function(from, cb){
		web3.eth.getBalance(from, function(error, bal){
			if (error){
				return cb(null, error)
			}
			return cb(bal, null)
		})
	}		
}
