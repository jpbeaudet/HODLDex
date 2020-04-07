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
console.log(MyContract.methods.totalSupply().call( async(error, result)=>{
	if(error){
		console.log("Err:"+error)
	}else{
		console.log(result)
	}
	}));	
module.exports = {
    public: function(){
		// set contractInstance.methods to make transactionobject creation easy
		var contractInstance = MyContract.methods;;
		// All public variables have automatically generated getters
		// http://bitcoin.stackexchange.com/a/38079/5464
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
		};
		console.log(JSON.stringify(result));
		return result;
		},
		
    byAddress: function(address){
		return true;
	}
}
