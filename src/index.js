var Web3 = require('web3');
const Eth = require('ethjs-query')
const EthContract = require('ethjs-contract')
const abi =[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Ask",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Bid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "who",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokens",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "totalEth",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "poolIndex",
				"type": "uint256"
			}
		],
		"name": "BoughtPool",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "who",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokens",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "poolIndex",
				"type": "uint256"
			}
		],
		"name": "RemovedTokensFromPool",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "who",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "poolIndex",
				"type": "uint256"
			}
		],
		"name": "RetreivedFundsFromPoolSell",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokens",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "poolIndex",
				"type": "uint256"
			}
		],
		"name": "SellingInPool",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "Trade",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "who",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "poolIndex",
				"type": "uint256"
			}
		],
		"name": "WithdrewRemainder",
		"type": "event"
	},
	{
		"stateMutability": "nonpayable",
		"type": "fallback"
	},
	{
		"inputs": [],
		"name": "Buy",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CancelAsk",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CancelBid",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_buyer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "approveTransactionForAddress",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_from",
				"type": "address"
			}
		],
		"name": "buyFromAddress",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_from",
				"type": "address"
			}
		],
		"name": "buyFromAsk",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyFromPool",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyFromReserve",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_buyer",
				"type": "address"
			}
		],
		"name": "cancelTransactionForAddress",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractBirthday",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentPriceUSDCent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ethPrice",
		"outputs": [
			{
				"internalType": "contract Medianizer",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAsks",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBids",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getEthPriceOfPool",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPriceMed",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tokens",
				"type": "uint256"
			}
		],
		"name": "getPriceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPriceWeiToIota",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getTokenBalanceOfPool",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "getTokenFor",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUsdWei2CentPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lockTheDoorAndLeaveTheKeyInside",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "poolBalanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "remainderBalanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tokens",
				"type": "uint256"
			}
		],
		"name": "removeTokensFromPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "reserveBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "sell",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tokens",
				"type": "uint256"
			}
		],
		"name": "sellInPool",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "sellToBid",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "sellerPool",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalEthValue",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalTokens",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "standard",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "txnb",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawEthFromPoolSale",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawRemainderEthereum",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
]

function startApp(web3,account) {
	const eth = new Eth(web3.currentProvider)
	const contract = new EthContract(eth)
	initContract(contract,account)
}

function initContract (contract,account) {
	var address = web3.utils.toChecksumAddress("0x34642A469e096138531E6396C50D2d416d0B47D7")
		var MyContract = new web3.eth.Contract(abi);
		MyContract.options.address = address
		console.log(MyContract)

//////jquery section within contract//////////
//////////////////////////////////////////////

//// buy section ///////
////////////////////////

// buy()
$( "#amountbutton1" ).click(function() {
	console.log("click")
	var amount = $("#amountb1").val()
	console.log("amount: "+amount)
	var units = $("#conversion1").val()
	console.log("units: "+units)
	var wei = (amount*(10**units))
	console.log("wei: "+units)
	if(amount && amount != 0){
		web3.eth.getBalance(account, function(err, bal){
			if (err){
				console.log(err)
			}
		console.log("eth balance for: "+account+" is: "+bal)
		if(bal >= wei && wei >= 250000000000000000){
			$('#myModal').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.Buy().send( {from: account, value: wei},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			 //not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth Ether Balance Or Amoutn sent is lower then 0.25 ETH: "+bal
		}
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of Ether sent cannot be 0 or blank or less then 0.25 ETH"
	}
});// end of buy()  

// buyFromReserve()
$( "#amountbutton2" ).click(function() {
	console.log("click")
	var amount = $("#amountb2").val()
	console.log("amount: "+amount)
	var units = $("#conversion2").val()
	console.log("units: "+units)
	var wei = (amount*(10**units))
	console.log("wei: "+units)
	if(amount && amount != 0){
		web3.eth.getBalance(account, function(err, bal){
			if (err){
				console.log(err)
			}
		console.log("eth balance for: "+account+" is: "+bal)
		if(bal >= wei && wei >= 250000000000000000){
			$('#myModal').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.buyFromReserve().send( {from: account, value: wei},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			// not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth Ether Balance Or Amoutn sent is lower then 0.25 ETH: "+bal
		}
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of Ether sent cannot be 0 or blank or less then 0.25 ETH"
	}	
});// end of buyFromReserve() 

// buyFromAddress()
$( "#amountbutton3" ).click(function() {
	console.log("click")
	var amount = $("#amountb3").val()
	console.log("amount: "+amount)
	var units = $("#conversion3").val()
	console.log("units: "+units)
	var wei = (amount*(10**units))
	console.log("wei: "+units) 
	var to = $("#addressb3").val()
	console.log("to: "+to)
	if(amount && to && amount != 0){
		$("#message1").html("<small>Enter A Valid Ethereum Address</small>")
		// check if to is valid address
		web3.eth.getBalance(to, function(errTo, addr){
			if (errTo){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address"
			}
		web3.eth.getBalance(account, function(err, bal){
			if (err){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address: "+err
			}
		console.log("eth balance for: "+account+" is: "+bal)
		if(bal >= wei){
			$('#myModal').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.buyFromAddress(to).send( {from: account, value: wei},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			// not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth Ether Balance: "+bal
		}
	})
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of Ether sent cannot be 0 or blank"
	}	
});// end of buyFromReserve() 	

// buyFromAsk()
$( "#amountbutton4" ).click(function() {
	console.log("click")
	var amount = $("#amountb4").val()
	console.log("amount: "+amount)
	var units = $("#conversion4").val()
	console.log("units: "+units)
	var wei = (amount*(10**units))
	console.log("wei: "+units) 
	var to = $("#addressb4").val()
	console.log("to: "+to)
	if(amount && to && amount != 0){
		$("#message2").html("<small>Enter A Valid Ethereum Address</small>")
		// check if to is valid address
		web3.eth.getBalance(to, function(errTo, addr){
			if (errTo){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address"
			}
		web3.eth.getBalance(account, function(err, bal){
			if (err){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address: "+err
			}
		console.log("eth balance for: "+account+" is: "+bal)
		if(bal >= wei){
			$('#myModal').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.buyFromAsk(to).send( {from: account, value: wei},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			// not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth Ether Balance: "+bal
		}
	})
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of Ether sent cannot be 0 or blank"
	}	
});// end of buyFromAsk() 

// withdrawRemainderEthereum()
$( "#amountbutton5" ).click(function() {
	console.log("click")
			$('#myModal').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.withdrawRemainderEthereum().send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})	
});// withdrawRemainderEthereum()

// cancelBid()
$( "#amountbutton6" ).click(function() {
	console.log("click")
			$('#myModal').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.CancelBid().send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})	
});// cancelBid()

//// sell section ///////
////////////////////////

// sell()
$( "#amountbutton7" ).click(function() {
	console.log("click")
	var amount = $("#amounts1").val()
	console.log("amount: "+amount)
	var units = $("#hodlConversion1").val()
	console.log("units: "+units)
	var iota = (amount*(10**units))
	console.log("wei: "+units)
	if(amount && amount != 0){
		MyContract.methods.balanceOf(account).call( {from: account},async(err, bal)=>{
			if (err){
				console.log(err)
			}
		console.log("HODL balance for: "+account+" is: "+bal)
		if(bal >= iota){
			$('#myModalSell').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.sell(iota ).send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			 //not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth HODL Balance: "+bal
		}
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of HODL sent cannot be 0 or blank"
	}
});//end of sell()

// sellToBid()
$( "#amountbutton8" ).click(function() {
	console.log("click")
	var amount = $("#amounts2").val()
	console.log("amount: "+amount)
	var units = $("#hodlConversion2").val()
	console.log("units: "+units)
	var iota = (amount*(10**units))
	console.log("wei: "+units) 
	var to = $("#address2").val()
	console.log("to: "+to)
	if(amount && to && amount != 0){
		$("#message3").html("<small>Enter A Valid Ethereum Address</small>")
		// check if to is valid address
		web3.eth.getBalance(to, function(errTo, addr){
			if (errTo){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address"
			}
		MyContract.methods.balanceOf(account).call( {from: account},async(err, bal)=>{
			if (err){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address: "+err
			}
		console.log("eHODL balance for: "+account+" is: "+bal)
		if(bal >= iota){
			$('#myModalSell').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.sellToBid(to, iota).send( {from: account,},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			// not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth HODL Balance: "+bal
		}
	})
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of HODL sent cannot be 0 or blank"
	}	
});// sellToBid()

// approveTransactionForAddress()
$( "#amountbutton9" ).click(function() {
	console.log("click")
	var amount = $("#amounts3").val()
	console.log("amount: "+amount)
	var units = $("#hodlConversion3").val()
	console.log("units: "+units)
	var iota = (amount*(10**units))
	console.log("wei: "+units) 
	var to = $("#address3").val()
	console.log("to: "+to)
	if(amount && to && amount != 0){
		$("#message4").html("<small>Enter A Valid Ethereum Address</small>")
		// check if to is valid address
		web3.eth.getBalance(to, function(errTo, addr){
			if (errTo){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address"
			}
		MyContract.methods.balanceOf(account).call( {from: account},async(err, bal)=>{
			if (err){
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= No a valid ethereum address: "+err
			}
		console.log("HODL balance for: "+account+" is: "+bal)
		if(bal >= iota){
			$('#myModalSell').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.approveTransactionForAddress(to, iota).send( {from: account,},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			// not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth HODL Balance: "+bal
		}
	})
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of HODL sent cannot be 0 or blank"
	}	
});// sellToBid()

// cancelAsk()
$( "#amountbutton10" ).click(function() {
	console.log("click")
			$('#myModalSell').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.CancelAsk().send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})	
});// cancelAsk()

//// pool section ///////
///////////////////////

// buyFromPool()
$( "#amountbutton11" ).click(function() {
	console.log("click")
	var amount = $("#amountp11").val()
	console.log("amount: "+amount)
	var units = $("#conversion5").val()
	console.log("units: "+units)
	var wei = (amount*(10**units))
	console.log("wei: "+units)
	if(amount && amount != 0){
		web3.eth.getBalance(account, function(err, bal){
			if (err){
				console.log(err)
			}
		console.log("eth balance for: "+account+" is: "+bal)
		if(bal >= wei){
			$('#myModalPool').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.buyFromPool().send( {from: account, value: wei},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			 //not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth Ether Balance: "+bal
		}
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of Ether sent cannot be 0 or blank"
	}
});// end of buyFromPool()

// sellInPool()
$( "#amountbutton12" ).click(function() {
	console.log("click")
	var amount = $("#amountp1").val()
	console.log("amount: "+amount)
	var units = $("#hodlConversion4").val()
	console.log("units: "+units)
	var iota = (amount*(10**units))
	console.log("wei: "+units)
	if(amount && amount != 0){
		MyContract.methods.balanceOf(account).call( {from: account},async(err, bal)=>{
			if (err){
				console.log(err)
			}
		console.log("HODL balance for: "+account+" is: "+bal)
		if(bal >= iota){
			$('#myModalPool').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.sellInPool(iota ).send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
		}else{
			 //not enougth balance
			var basePath = location.protocol + '//' + location.host + location.pathname
			window.location.href= basePath+"?error=Not Enougth HODL Balance: "+bal
		}
	})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of HODL sent cannot be 0 or blank"
	}
});//end of sellInPool()

// removeTokensFromPool()
$( "#amountbutton13" ).click(function() {
	console.log("click")
	var amount = $("#amountp2").val()
	console.log("amount: "+amount)
	var units = $("#hodlConversion5").val()
	console.log("units: "+units)
	var iota = (amount*(10**units))
	console.log("wei: "+units)
	if(amount && amount != 0){
			$('#myModalPool').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.removeTokensFromPool(iota ).send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})
	}else{
		//amount to 0 
		var basePath = location.protocol + '//' + location.host + location.pathname
		window.location.href= basePath+"?error=Amount of HODL sent cannot be 0 or blank"
	}
});//end of removeTokensFromPool()

// cancelAsk()
$( "#amountbutton14" ).click(function() {
	console.log("click")
			$('#myModalPool').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.withdrawEthFromPoolSale().send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})	
});// cancelAsk()

// withdrawRemainderEthereum()
$( "#amountbutton15" ).click(function() {
	console.log("click")
			$('#myModalPool').modal('toggle');
			document.getElementById("loader").style.display = "block";
			MyContract.methods.withdrawRemainderEthereum().send( {from: account},async(error, result)=>{
				if(error){
					var basePath = location.protocol + '//' + location.host + location.pathname
					window.location.href=basePath+"?error= "+error
				}
				console.log(JSON.stringify(result))				
			})
			.then(function (txHash) {
				console.log('Transaction sent')
				console.log(txHash)
				//waitForTxToBeMined(txHash)
				// tx pending
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href= basePath+"?msg=Transaction Success: "+txHash
			})
		.catch(function(error) {
				console.error(error);
				var basePath = location.protocol + '//' + location.host + location.pathname
				window.location.href=basePath+"?error= Refused by User: "+JSON.stringify(error)
		})	
});// withdrawRemainderEthereum()

}// end init contract
//////////////////////////////////////////
	
/////// test  & utils
///////////////////////////////
function isLocked() {
   web3.eth.getAccounts(function(err, accounts){
      if (err != null) {
         console.log(err)
      }
      else if (accounts.length === 0) {
         console.log('Client : MetaMask is locked')
        
      }
      else {
         console.log('Client : MetaMask is unlocked')
      }
   });
}


async function waitForTxToBeMined (txHash) {
	let txReceipt
	while (!txReceipt) {
		try {
			txReceipt = await web3.eth.getTransactionReceipt(txHash)
		} catch (err) {
			console.log("err: "+err)
			//window.location.href=window.location.href+"?error="+err
		}
	}
	console.log("success: "+txReceipt)
	// tx completed
	window.location.href=window.location.href+"?msg=Transaction Completed: "+txReceipt
}

// main()
isLocked()
web3 = window.web3;
    if (typeof web3 !== 'undefined') {
		
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
        window.web3 = new Web3(web3.currentProvider);
          if (web3.currentProvider.isMetaMask === true || web3.currentProvider.isMist ) {
			  console.log("indexjs metamask or mist");
        //window.ethereum.enable()
        console.log(account)
		startApp(web3,account);
	}
	}
