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
				console.log(result)
				results.totalSupply = result

			//end of total supply
			MyContract.methods.reserveBalance().call( async(error, result)=>{	
				if(error){
					return ("Err:"+error)
				}
					console.log(result)
					results.reserveBalance =  result				
		
			})
			//end of reserveBalance
				MyContract.methods.getContractAddress().call( async(error, result)=>{	
					if(error){
						return ("Err:"+error)
					}
						console.log(result)
						results.getContractAddress =  result				
		
				})
				//end of getContractAddress
					MyContract.methods.txnb().call( async(error, result)=>{	
						if(error){
							return ("Err:"+error)
						}
							console.log(result)
							results.txnb =  result				
	
					})
					//end of txnb
						MyContract.methods.getAsks().call( async(error, result)=>{	
							if(error){
								return ("Err:"+error)
							}
								console.log(result)
								results.getAsks ={}
								results.getAsks.address =  result["0"]	
								results.getAsks.amount=  result["1"]			
		
						})
						//end of getAsks
							MyContract.methods.getBids().call( async(error, result)=>{	
								if(error){
									return ("Err:"+error)
								}
									console.log(result)
									results.getBids ={}
									results.getBids.address = result["0"]	
									results.getBids.amount= result["1"]			
		
							})
							//end of getBids
								MyContract.methods.currentPriceUSDCent().call( async(error, result)=>{	
									if(error){
										return ("Err:"+error)
									}
										console.log(result)
										results.currentPriceUSDCent = result				
		
								})
								//end of currentPriceUSDCent
									MyContract.methods.getPriceOf(1).call( async(error, result)=>{	
										if(error){
											return ("Err:"+error)
										}
											console.log(result)
											results.getPriceOf = result				
	

									})
									//end of getCurrentUSDCent
									.then(async()=>{
										await promise
										return cb(results)
									})
	})	// end of nesting
	},
    public2: function(){
		// set contractInstance.methods to make transactionobject creation easy
		var contractInstance = MyContract.methods;
		var result = {
			"totalSupply": contractInstance.totalSupply(),
			"symbol": contractInstance.symbol(),
			"name": contractInstance.name(),
			"decimal": contractInstance.decimal(),
			"owner": contractInstance.owner(),
			"getContractAddress": contractInstance.getContractAddress(),
			"contractBirthday": contractInstance.contractBirthday(),
			"reserveBalance": contractInstance.reserveBalance(),
			"txnb": contractInstance.txnb(),
			"getAsk": contractInstance.getAsk(),
			"getBid": contractInstance.getBid(),
			"getCurrentUSDCent": "",
			"getPriceOf": "",
			"getTokenFor": "",
		};
		console.log(JSON.stringify(result));
		return result;
		},
		
    byAddress: function(address){
		return true;
	}
}
