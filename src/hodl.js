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
var _usd;	
module.exports = {
    public: function(cb){
		let promise = new Promise((resolve, reject) => {
			setTimeout(() => resolve("done!"), 1000)
		});		
		var results = {}

		// nesting async call to ensure a unified results{} return value
		MyContract.methods.totalSupply().call( async(error, result)=>{

			if(error){
				return ("Err:"+error)
			}
			results.totalSupply = result
			results.totalSupplyComma = commafy(result/(10**10))
			//end of total supply
		//Goin Gecko	

			
			MyContract.methods.reserveBalance().call( async(error, result)=>{	
				if(error){
					return ("Err:"+error)
				}
				results.reserveBalance = commafy( (result / (10**10)).toFixed(10)	)			
		
			})
			//end of reserveBalance
				MyContract.methods.getContractAddress().call( async(error, result)=>{	
					if(error){
						return ("Err:"+error)
					}
					results.getContractAddress =  result				
		
				})
				//end of getContractAddress
					MyContract.methods.txnb().call( async(error, result)=>{	
						if(error){
							return ("Err:"+error)
						}
						results.txnb =  result				
	
					})
					//end of txnb
						MyContract.methods.getAsks().call( async(error, result)=>{	
							if(error){
								return ("Err:"+error)
							}
							results.getAsks ={}
							results.getAsks.address =  result["0"]	
							results.getAsks.amount=  result["1"]			
							//results.getAsks.address = ["0xbfhfgr665h5h55"]	
							//results.getAsks.amount= [1234]			
						})
						//end of getAsks
							MyContract.methods.getBids().call( async(error, result)=>{	
								if(error){
									return ("Err:"+error)
								}
								results.getBids ={}
								results.getBids.address = result["0"]	
								results.getBids.amount= result["1"]			
	
							})
							//end of getBids
								MyContract.methods.currentPriceUSDCent().call( async(error, result)=>{	
									if(error){
										return ("Err:"+error)
									}
									_usd = result
									results.currentPriceUSDCent = result/10000				
									results.priceIncreasePerCent = ((result/100) / 0.01)*100
									results.marketcap = commafy( ((results.totalSupply/(10**10))* results.currentPriceUSDCent).toFixed(2))
									let ethPrice = async() => {
										//let data = await CoinGeckoClient.coins.list();
										let data = await CoinGeckoClient.coins.fetch('ethereum', {});
										results.ethPrice = {
											USD: data.data.market_data.current_price.usd,
											EUR: data.data.market_data.current_price.eur,
											CAD: data.data.market_data.current_price.cad,
											BTC: data.data.market_data.current_price.btc,
											LTC: data.data.market_data.current_price.ltc,
											EOS: data.data.market_data.current_price.eos
										}
										
										results.getPriceOf = commafy((((result/10000)*((10**18)/(data.data.market_data.current_price.usd*10000)))/(10**14)).toFixed(9))
										results.getPriceOfWei = commafy(Math.floor( (((result)*((10**18)/(data.data.market_data.current_price.usd*10000))))))
										// leave that to explore as a LOT of data is avalable in there
										//console.log("data ", JSON.stringify(data.data.market_data.current_price))
									};
									 ethp = ethPrice()
								})
								//end of currentPriceUSDCent
									MyContract.methods.getPriceOf(1).call( async(error, result)=>{	
										if(error){
											return ("Err:"+error)
										}
										results.getPriceOfPaid = (result	/ (10**8)).toFixed(9)
									})
									//end of getCurrentUSDCent
									.then(async()=>{
										//wait for results
										await promise
										return cb(results)
									})
		})	// end of nesting
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
				MyContract.methods.getCount().call( async(error, result)=>{
					if(error){
						return cb(null, error)
					}
					var count =   result
						
						
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
	}
}
