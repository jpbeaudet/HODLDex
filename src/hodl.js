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

			//end of total supply
			MyContract.methods.reserveBalance().call( async(error, result)=>{	
				if(error){
					return ("Err:"+error)
				}
				results.reserveBalance =  result				
		
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
									results.currentPriceUSDCent = result				
		
								})
								//end of currentPriceUSDCent
									MyContract.methods.getPriceOf(1).call( async(error, result)=>{	
										if(error){
											return ("Err:"+error)
										}
										results.getPriceOf = result				
									})
									//end of getCurrentUSDCent
									.then(async()=>{
										//wait for results
										await promise
										return cb(results)
									})
		})	// end of nesting
	},		
    byAddress: function(address){
		return true;
	}
}
