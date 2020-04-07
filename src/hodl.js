/*
Public address of the key:   0x3F252493e949bBAc22cDd9D9f220F9645F2fF923
Path of the secret key file: C:\Users\jpbea\AppData\Local\Ethereum\keystore\UTC--2020-04-06T22-07-55.432867100Z--3f252493e949bbac22cdd9d9f220f9645f2ff923
*/
var Web3 = require('web3');
var solc = require("solc");
var fs = require('fs');

// Connect to a geth server over JSON-RPC
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:30303"));
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
console.log("Talking with a geth server", web3.version.api);

// Read standard token contract from https://www.ethereum.org/token
//var sourceCode = fs.readFileSync('./src/hodl/hodl.sol','UTF-8')
//var compiled = solc.compile(JSON.stringify(input));
//console.log(compiled)
var output = JSON.parse(solc.compile(JSON.stringify(input)));
//console.log(output.contracts['hodl']["HODL"].abi)
var abiArray = output.contracts['hodl']["HODL"].abi;
//abiArray = JSON.parse(abiArray);
var address = "0x34642A469e096138531E6396C50D2d416d0B47D7"
// Create a proxy object to access the smart contract
var MyContract = new web3.eth.Contract(abiArray);
MyContract.options.address = address
console.log(MyContract.methods.totalSupply().call( {from: "0xA4ab16FA7F26aa482f2736f386533A406f7B9183"},async(error, result)=>{
	if(error){
		console.log("Err:"+error)
	}else{
		console.log(result)
	}
	}))
// instantiate by address
;
//var contractInstance = MyContract.at(address);

// All public variables have automatically generated getters
// http://bitcoin.stackexchange.com/a/38079/5464

//console.log(JSON.stringify(result));
	
module.exports = {
    public: function(){
		var contractInstance = MyContract.methods;

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
