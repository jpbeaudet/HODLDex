pragma solidity 0.6.4;

contract Owned {

    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner)
        revert("This function is restricted to smartcontract owner, if there is still one. ");
         _;
    }

    //This function is invoked once and will assign the ownership to the smart contract address,
    //thus locking the door to any control, for ever. God have mercy on us

    function lockTheDoorAndLeaveTheKeyInside() external onlyOwner {
        owner = address(this);
    }
}

/* Interfaces */

interface tokenRecipient { 
    function receiveApproval(address _from, uint256 _value, address _token,bytes calldata _extraData) external;
}

interface Medianizer{
        function read() external returns(bytes32);
    }

contract HODL is Owned {

/* Public variables of the token */

string constant public standard = 'v1';
string constant public name="HODLCommodity";
string constant public symbol="HODL";
uint8 constant public decimals=10;
uint256 constant public totalSupply=20000000 * (10**10);
uint256 public contractBirthday;

/*Set the fixed buying price variable */
uint256 private constant basePrice = 1; // 10 * 1/100 cents = 1 cent
uint256 private currentPrice = basePrice  ; // current price in 100th of a cents USD
uint256 public currentPriceUSDCent =  currentPrice ; // get price in 100th of a cent for precision, should be interpreted at with one additional decimal point 0,001. 
uint256 private priceIncrease = 1 ; // increase by 100th of a cent
uint256 public txnb = 0; // set tx number
uint256 oldUsd2Eth = 0;
uint256 private payee = 0;
uint256 private price;
bytes32 private valueToConvert = 0x0000000000000000000000000000000000000000000000072c3d4f770fcf8000;

/*Set the reserve balance variable*/
uint256 public reserveBalance = totalSupply;

/*Initialize external contract that brings in the USD value for ETH*/
Medianizer public ethPrice;

/* Modifiers */

modifier crowdsalePeriod {
    if (txnb < 100000) {
        require( msg.value <= 1 ether, "Transaction limited to 1 ether for the crowdsale period until the 100,000th transaction, participant asks(selling) will still have precedence over reserve");
    }
    _;       
}
/* add a guard method to protect from re-entrency*/

modifier guard {
    require(isPending[msg.sender] == false, "address in pending mode");
    isPending[msg.sender] =true;
    _;
}

/* Structs */
struct Bids {

    uint amount;
    uint256 index;
    bool inArray;
}

struct Asks {
    
    uint amount;
    uint256 index;
    bool inArray;
}

struct Pool {

    uint256 totalEthValue;
    uint256 totalTokens;
}

struct PoolSell {

    bool exists;
    uint256 qtyTokens;
    uint256 tokenPrice;
    uint256 poolIndex;
}

struct TokenOwner {
    bool isOwner;
    uint256 index;
}

/* Mappings */

mapping (address => mapping (address => uint256)) private allowance;
mapping (address => uint256) private remainderBalances;
mapping (address => uint256) private balances;
mapping (address => PoolSell) private poolBalances;
mapping (address => Asks) private asks;
mapping (address => Bids) private bids;
mapping (uint256 => Pool) public sellerPool;
mapping (address => TokenOwner) private tokenOwners;
mapping (address => bool) private isPending;

/* Arrays */

address[] private owners;
address[] private askAddresses;
address[] private bidAddresses;

uint256 internal poolIndex = 0;

/* Events */

event Transfer(address indexed from, address indexed to, uint256 value);
event Bid(address indexed from, uint256 value);
event Ask(address indexed from, uint256 value);
event Trade(address indexed from, address indexed to, uint256 indexed value, uint256 newPrice);
event SellingInPool(address indexed from, uint256 tokens, uint256 indexed price, uint256 indexed poolIndex);
event BoughtPool(address indexed who, uint256 tokens, uint256 indexed totalEth, uint256 indexed poolIndex);
event RemovedTokensFromPool(address indexed who, uint256 indexed tokens, uint256 indexed poolIndex);
event RetreivedFundsFromPoolSell(address indexed who, uint256 amount, uint256 indexed poolIndex);
event WithdrewRemainder(address indexed who, uint256 amount, uint256 indexed poolIndex);

/* Initializes contractt */

constructor () public{
    /* Set now as the contract birthday*/
    contractBirthday = now;

    /* Give the contract all tokens*/
    balances[address(this)] = totalSupply;

    /* Bring in the external contract for eth price*/
    ethPrice = Medianizer(0x729D19f657BD0614b4985Cf1D82531c67569197B);        
}

/* This unnamed function is called whenever someone tries to send ether to it */
fallback() external {
    
    revert('random eth sent to this address will be rejected');// Prevents accidental sending of ether
}

/* Unset isPending from address */
function unsetPending (address _address) private {
    isPending[_address] = false;
}

/* Set new price increase */
function setPrice() internal returns(uint256 _newPrice){
    txnb++;
    currentPriceUSDCent = currentPrice + priceIncrease;
    return currentPriceUSDCent;
}

/* Convert Medianizer byte32 to int */
function convert(bytes32 b) internal pure returns(uint) {
    return uint(b)/10**14; // **14 instead of 16 to extract in 100th of a cent
}

/* Get price of 1 iota in wei */
function getPriceWeiToIota() public returns(uint256){
    // get wei price for 1 iota at the newest conversion rate
    price = (currentPrice * getUsdWei2CentPrice()) /10**10;
    return price; 
}

function getPriceMed() external returns(bytes32){
    return ethPrice.read();
}

function convertValue(bytes32 value) internal pure returns (uint256){
    uint256 usd2Eth = convert(value);
    uint256 wei2Cent = (10**18) / usd2Eth;
    return wei2Cent;
}

/* get current eth value of current price*/
function getUsdWei2CentPrice() public payable returns(uint256 _price) {
	// dummy value in case medianizer send a 0x value
	try this.getPriceMed() returns (bytes32 value) {
	    valueToConvert = value;
	    return convertValue(valueToConvert);
	} catch {
	    return convertValue(valueToConvert);
	}
}

/* get poll balance of address */
function poolBalanceOf(address _address) view public returns(uint256,uint256,uint256){

    return (poolBalances[_address].qtyTokens, poolBalances[_address].tokenPrice, poolBalances[_address].poolIndex);
    
}

/* get balance of address */
function balanceOf(address _address) view public returns(uint256){

    return balances[_address];
}

/* get remainder balance of address */
function remainderBalanceOf(address _address) view public returns(uint256){

    return remainderBalances[_address];
}

/* Pre-Approve a transaction from the sender's address to n amount */
function approveTransactionForAddress(address _buyer, uint256 _amount) public returns (bool success) {
    
    allowance[msg.sender][_buyer] = _amount;
    return true;
}

/* Cancel pre-approved transaction with address */
function cancelTransactionForAddress(address _buyer) public returns (bool success) {
    
    allowance[msg.sender][_buyer] = 0;
    return true;
}

/* Get actual contract adress */
function getContractAddress() public view returns (address){
    
    return 
    address(this);
}

/* get price of x nb of tokens */
function getPriceOf(uint _tokens) view public returns(uint256){
    
    return price * _tokens;
}

/* get price for an amount of ether */
function getTokenFor(uint _amount) view public returns(uint256){
    
    return _amount / price;
}

/* this returns the price in ether required to buy the pool with the index entered*/
function getEthPriceOfPool(uint256 index) public view returns(uint256) {

    return sellerPool[index].totalEthValue;
}

/* this returns the quantity of tokens in the pool with the index entered*/
function getTokenBalanceOfPool(uint256 index) public view returns(uint256) {

    return sellerPool[index].totalTokens;
}

/* Manage arrays */
// push new owner in owners array
function pushOwnerIntoArray(address msgSender) internal {
    if(reserveBalance > 0){
        if(!tokenOwners[msgSender].isOwner) {
            tokenOwners[msgSender].index = owners.length;
            owners.push(msgSender);
        }
    }
}

//removes address from owner array if the address balance is zero
function popOwnerOutOfArray(address seller) internal {
    if(reserveBalance > 0){    
        if(balances[seller] == 0){
            uint256 index;
            if (owners.length == 0){
                index = 0;
            }else{
                index = owners.length - 1;
            }
            owners[tokenOwners[seller].index] = owners[index];
            owners.pop();
        }
    }
}

//removes address from askAddresses array
function popAskOutOfArray(address _seller, uint256 count) internal {
    Asks storage ask = asks[_seller];
    if(ask.amount == 0) {
        askAddresses[ask.index] = askAddresses[count-1];
        ask.inArray = false;
        asks[askAddresses[count-1]].index = ask.index;
        askAddresses.pop();
    }
}
//removes address from bidAddresses array
function popBidOutOfArray(address _buyer, uint256 count) internal {
    Bids storage bid = bids[_buyer]; 
    //remove bid if its zero
    if(bid.amount == 0) {
        bidAddresses[bid.index] = bidAddresses[count-1];
        bid.inArray = false;
        bids[bidAddresses[count-1]].index = bid.index;
        bidAddresses.pop();
    }   
}
/* Withdraw funds from remainder, 
You can only have a remainder if you buy the pool by sending more eth than needed*/
function withdrawRemainderEthereum() payable public guard {
    require(remainderBalances[msg.sender] != 0, "Remainder balance is 0 for this address");
    uint256 remEth = remainderBalances[msg.sender];
    remainderBalances[msg.sender] = 0;
    payable(msg.sender).transfer(remEth);
    emit WithdrewRemainder(msg.sender, remEth, poolIndex - 1);
    unsetPending(msg.sender);
}

/* Withdraw funds from pool sale
once the pool has been bought you can withdraw the funds of the token sale */
function withdrawEthFromPoolSale() payable public guard{
    PoolSell storage sender = poolBalances[msg.sender];
    require(sender.poolIndex < poolIndex,"Pool is not closed yet");
    require(sender.exists, "Address not in Pool");
    uint256 tokens = sender.qtyTokens;
    sender.qtyTokens = 0;
    sender.exists = false;
    uint256 eth = tokens * sender.tokenPrice;
    payable(msg.sender).transfer(eth);
    sellerPool[sender.poolIndex].totalEthValue -= eth;
    emit RetreivedFundsFromPoolSell(msg.sender, eth, sender.poolIndex);
    unsetPending(msg.sender);    
}

/* Remove tokens from sellers pool if they have not sold

this only works if the msg.sender has tokens in the current sellers pool (poolIndex)*/

function removeTokensFromPool(uint256 _tokens) public guard{

    PoolSell storage sender = poolBalances[msg.sender];
    require(sender.exists, "No tokens are being sold in the pool under this address");
    require(sender.qtyTokens >= _tokens, "not enough tokens owned by msg.sender");
    require(sender.poolIndex == poolIndex, "pool index is different");
    if(sender.qtyTokens == _tokens){sender.exists = false;}
    sender.qtyTokens -= _tokens;
    balances[address(this)] -= _tokens;
    uint256 eth = _tokens * sender.tokenPrice;
    sellerPool[sender.poolIndex].totalTokens -= _tokens;
    sellerPool[sender.poolIndex].totalEthValue -= eth;
    balances[msg.sender] += _tokens;
    pushOwnerIntoArray(msg.sender);
    emit RemovedTokensFromPool(msg.sender, _tokens, sender.poolIndex);
    unsetPending(msg.sender);
}

/* Sell tokens through the pool */

function sellInPool(uint256 _tokens) public guard returns(bool) {
    PoolSell storage sender = poolBalances[msg.sender];
    require(balances[msg.sender] >= _tokens, "token balance of the seller must be equal or greater to the amount they want to sell");
    require(!sender.exists, "seller cannot already have an amount pending in the pool, withdraw eth to clear");
    sender.tokenPrice = getPriceWeiToIota(); // price in wei for 1 iota(_tokens)
    sender.qtyTokens = _tokens; // number of Iotas 
    sender.poolIndex = poolIndex;
    sender.exists = true;
    balances[msg.sender] -= _tokens;
    balances[address(this)] += _tokens;
    popOwnerOutOfArray(msg.sender);
    sellerPool[sender.poolIndex].totalTokens += _tokens;
    sellerPool[sender.poolIndex].totalEthValue += _tokens * sender.tokenPrice;
    emit SellingInPool(msg.sender, _tokens, sender.tokenPrice, sender.poolIndex);
    unsetPending(msg.sender);
    return true;
}

/* Buy tokens from the pool of people that have sold to the pool*/

function buyFromPool() payable public crowdsalePeriod guard {
    Pool storage sPool = sellerPool[poolIndex];
    poolIndex++;
    require(sPool.totalTokens != 0, "Zero tokens to sell in the pool");
    require(sPool.totalEthValue != 0, "No tokens sent to the pool to be sold, eth value = 0");
    require(msg.value >= sPool.totalEthValue, "sender must have sent enough eth to cover the value");
    require(balances[address(this)] >= sPool.totalTokens, "confirming enough tokens are in the contract");
    uint256 remainder;
    uint256 tokens = sPool.totalTokens;
    sPool.totalTokens = 0;
    remainder = msg.value - sPool.totalEthValue;
    if(remainder != 0){remainderBalances[msg.sender] += remainder;}
    balances[address(this)] -= tokens;
    balances[msg.sender] += tokens;
    pushOwnerIntoArray(msg.sender);
    emit BoughtPool(msg.sender, tokens, sPool.totalEthValue, poolBalances[msg.sender].poolIndex);
    currentPrice = setPrice();
    unsetPending(msg.sender);
} 

/* Buy tokens from address directly , only if the address has approved the transaction*/

function buyFromAddress(address payable _from) public payable crowdsalePeriod guard {
    
    if (msg.value == 0) revert("Buy value cannot be 0");
    uint256 iotaPrice = getPriceWeiToIota(); // set a fixed price for the current transaction
    require(msg.value >= iotaPrice, "amount sent has to be higher than the buy price");
    uint tokens = msg.value / iotaPrice;
    
    // Check allowance
    if (tokens > allowance[_from][msg.sender]) revert("Tx is not approved");
    
    // check if seller had enougth
    if (balances[_from] < tokens) revert("Not enougth balance");
    remainderBalances[msg.sender] = msg.value - (tokens * iotaPrice);
    
    // reduce number of tokens from allowance
    allowance[_from][msg.sender] -= tokens;
    balances[_from] -= tokens; // set the seller tokens balance
    
    //removes address from owner array if the address balance is zero
    popOwnerOutOfArray(_from);
    
    // set the buyer tokens balance    
    balances[msg.sender] += tokens; 

    // transfer ether to the seller
    _from.transfer(msg.value);
    
    // set new price
    currentPrice = setPrice(); 
    
    // set owners array
    pushOwnerIntoArray(msg.sender);
    
    // execute an event reflecting the change
    emit Trade(_from, msg.sender, tokens, currentPriceUSDCent);
    unsetPending(msg.sender);
}

/* Buy tokens an existing ask directly */

function buyFromAsk(address payable _from) public payable crowdsalePeriod guard{
    
    if (msg.value == 0) revert("Buy value cannot be 0");
    uint256 iotaPrice = getPriceWeiToIota(); // set a fixed price for the current transaction
    require(msg.value >= iotaPrice, "amount sent has to be higher than the buy price");
    Asks storage ask = asks[_from];
    uint256 weiNeeded = ask.amount * iotaPrice;
    if (ask.amount == 0) revert("Bids for this address is 0");
    
    // check if the bid still has valid balance
    remainderBalances[msg.sender] = msg.value - weiNeeded;
    uint256 tokens = ask.amount;
    ask.amount = 0;
            
    //removes address from owner array if the address balance is zero
    popOwnerOutOfArray(_from);
    
    // add the token to the buyer
    balances[msg.sender] += tokens; 

    // transfer ether to the seller
    _from.transfer(weiNeeded);

    // set new price
    currentPrice = setPrice(); 
    
    // set owners array
    pushOwnerIntoArray(msg.sender);
   
    popAskOutOfArray(_from, askAddresses.length);   
    // execute an event reflecting the change
    emit Trade(_from, msg.sender, tokens, currentPriceUSDCent);
    unsetPending(msg.sender);
    
} 

/*  Sell tokens an existing bid directly */

function sellToBid(address payable _to, uint256 _amount) public guard {
    
    if(_amount > balances[msg.sender]) revert("not enougth tokens to sell");
    uint256 iotaPrice = getPriceWeiToIota(); // set a fixed price for the current transaction
    Bids storage bid = bids[_to];
    if (bid.amount == 0) revert("Bids for this address is 0");
    uint256 cost = _amount * iotaPrice; 
    // if a bid order match the sell order
    bid.amount -= cost; //substract the the cost from the bid
    // subtract the token amount corresponding to the eth amount to the balance
    balances[msg.sender] -= _amount;
        
    // add the token amount corresponding to the eth amount to the balance
    balances[_to] += _amount;
        
    // transfer cost in ether to the buyer
    payable(msg.sender).transfer(cost);    
        
    // set new price
    currentPrice = setPrice(); 
        
    // set owners array
    popOwnerOutOfArray(msg.sender);
    popBidOutOfArray(_to, bidAddresses.length);        
    // execute an event reflecting the change
    emit Trade(_to, msg.sender, _amount, currentPriceUSDCent);
    unsetPending(msg.sender);
    
} 

/* Buy token from the smart contract initial reserve */

function buyFromReserve() public payable crowdsalePeriod guard {
    require(reserveBalance > 0, "No Hodl left in the reserve to buy, purchase using other functions");
    if (msg.value == 0) revert("Buy value cannot be 0");
    uint256 iotaPrice = getPriceWeiToIota(); // set a fixed price for the current transaction    
    require(msg.value >= iotaPrice, "amount sent has to be higher than the buy price");
    uint tokens = msg.value / iotaPrice; // calculates the amount of tokens
    
    // if the reserve has not enougth balance for the number of tokens, buy the rest fo the reserve.
    if(reserveBalance < tokens) {
        tokens = reserveBalance;
    }
    // set reserve balance
    reserveBalance -= tokens; 
    
    // set balance of the smart contract
    balances[address(this)] -= tokens;
    
    // the the buyer balance
    balances[msg.sender] += tokens;  
    
    // set any remainder
    remainderBalances[msg.sender] = msg.value - (tokens * iotaPrice);
    
    // adds tokens to buyer's balance
    pushOwnerIntoArray(msg.sender);
    
    // set new price
    currentPrice = setPrice(); 
    
    // hopefully the contract is the one that calls this
    redistribute(tokens * iotaPrice);
    
    // execute an event reflecting the change
    emit Trade(address(this), msg.sender, tokens, currentPriceUSDCent); 
    unsetPending(msg.sender);

}

/* Buy function: buy from current asks or from the reserve(if not empty) or create a bid */

function Buy() public payable crowdsalePeriod guard returns (bool success){

    if (msg.value == 0) revert("Buy value cannot be 0");
    uint256 iotaPrice = getPriceWeiToIota(); // set a fixed price for the current transaction  
    require(msg.value >= iotaPrice, "amount sent has to be higher than the buy price");
    uint tokens = msg.value / iotaPrice;
    
    // loop througth existing asks before creating a bid
    uint256 count = askAddresses.length;
    for (uint i=0; i<count; i++) {
        Asks storage ask = asks[askAddresses[i]];
        // if a ask exsit with anougth balance
        if (ask.amount >= tokens ) {
        
            //substract tokens amount from the ask
            ask.amount -= tokens;
            

            // add tokens to the balance of the buyer
            balances[msg.sender] += tokens;
            
            // transfer ether to the seller
            payable(askAddresses[i]).transfer(tokens * iotaPrice);
            
            // set remainder balance
            remainderBalances[msg.sender] = msg.value - (tokens * iotaPrice);
            
            // set new price
            currentPrice = setPrice(); 
            
            // set owners array
            pushOwnerIntoArray(msg.sender);
            
            // execute an event reflecting the change
            emit Trade(askAddresses[i], msg.sender, tokens, currentPriceUSDCent);
            
             //remove ask if its zero
           // popAskOutOfArray(msg.sender, count);
            popAskOutOfArray(askAddresses[i], count);            
            unsetPending(msg.sender);
            return true;
        }
    }

    // if no match and reserve is empty, create a new bid
    if(reserveBalance == 0) {
        Bids storage bid = bids[msg.sender];
        
        // set the bid order 
        bid.amount += msg.value; 
        
        // add bid address to bidAdresses[]
        if(!bid.inArray){
            bidAddresses.push(msg.sender);
            bid.index = bidAddresses.length-1;
            bid.inArray = true;
        }
        
        // execute an event reflecting the change
        emit Bid(msg.sender, msg.value); 
        unsetPending(msg.sender);
        return true;
    }
    
    //if reserve is not empty, buy from reserve before creating a new bid
    if (reserveBalance < tokens){ 
        tokens = reserveBalance;
    }
    // subtracts tokens from reserve balance
    balances[address(this)] -= tokens;
    
    // set the reserve balance public variable
    reserveBalance -= tokens; 
    
    // adds tokens to buyer's balance
    balances[msg.sender] += tokens; 
    
    // set owner array
    owners.push(msg.sender);
    
    // set any remainder of eth from tx
    remainderBalances[msg.sender] = msg.value - (tokens * iotaPrice);
    
    // set new price
    currentPrice = setPrice(); 
    
    // hopefully the contract is the one that calls this
    redistribute(tokens * iotaPrice);
    
    // execute an event reflecting the change
    emit Trade(address(this), msg.sender, tokens, currentPriceUSDCent); 
    unsetPending(msg.sender);
    return true;
    
}

/* Sell token or place a bid in the board */

function sell(uint256 _amount) public guard returns(bool success){

    if (_amount == 0) revert("sell value cannot be 0");
    // checks if the sender has enough to sell
    if (balances[msg.sender] < _amount ) revert("Your token balance is too low");
    // get current cost for requested tokens
    uint256 cost = _amount * getPriceWeiToIota();
  
    // loop througth existing bids before creating an ask
    uint256 count = bidAddresses.length;
    for (uint i=0; i<count; i++) {
        Bids storage bid = bids[bidAddresses[i]];
        if (bid.amount >= cost) {
        // if a bid order match the sell order
        bid.amount -= cost; //substract the the cost from the bid
        
        // subtract the token amount corresponding to the eth amount to the balance
        balances[msg.sender] -= _amount;
        
        // add the token amount corresponding to the eth amount to the balance
        balances[bidAddresses[i]] += _amount;
        
        // transfer cost in ether to the buyer
        payable(msg.sender).transfer(cost);    
        
        // set new price
        currentPrice = setPrice(); 
        
        // set owners array
        popOwnerOutOfArray(msg.sender);
        
        // execute an event reflecting the change
        emit Trade(bidAddresses[i], msg.sender, _amount, currentPriceUSDCent);
        popBidOutOfArray(bidAddresses[i], count);
        unsetPending(msg.sender);
        return true;
        }
    } 
   
    // if none, create a new ask
    Asks storage ask = asks[msg.sender];
    
    // set ask amount and index count
    ask.amount += _amount;
    
    // set the token balance of the seller
    balances[msg.sender] -= _amount; 
    
    // add ask address to the list
    if(!ask.inArray){
        askAddresses.push(msg.sender);
        ask.index = askAddresses.length-1;
        ask.inArray = true;
    }
    
    // execute an event reflecting the change 
    emit Ask(msg.sender, _amount); 
    unsetPending(msg.sender);
    return true;
}

/* Remove a current bid */

function CancelBid () public {
    uint256 count = bidAddresses.length;
    Bids storage bid = bids[msg.sender];    
    // get current bid value
    uint256 currentBid = bid.amount;
    // remove the tokens form the bids
    bid.amount -= currentBid;
    // transfer ether back to the asker
    msg.sender.transfer(currentBid);
    //remove bid if its zero
    popBidOutOfArray(msg.sender, count);
}

/* get bids list */

function getBids () public view returns(address[] memory, uint256[] memory) { 

    uint256 count = bidAddresses.length;
    address[] memory addresses= new address[](count);
    uint[] memory amounts= new uint256[](count);
    for (uint i=0; i<count; i++) {
        addresses[i] = bidAddresses[i];
        amounts[i]= bids[addresses[i]].amount;
    }
    return (addresses, amounts);
}

/* get asks list */

function getAsks () public view returns(address[] memory, uint256[] memory) { 
    
    // set array
    uint256 count = askAddresses.length;
    address[] memory addresses= new address[](count);
    uint[] memory amounts= new uint256[](count);
    // add address and amount from the asks struct
    for (uint i=0; i<count; i++) {
        addresses[i] = askAddresses[i];
        amounts[i]= asks[addresses[i]].amount;
    }
    // return both arays in a tuple
    return (addresses, amounts);
}

/* Remove a current asks */

function CancelAsk () public {
    uint256 count = askAddresses.length;
    Asks storage ask = asks[msg.sender];    
    // get current bask value
    uint256 currentAsk = ask.amount;

    // remove the tokens from the asks
    ask.amount -= currentAsk;
    //send back token to the seller
    balances[msg.sender] += currentAsk;    
    //remove ask for askAddresses
    popAskOutOfArray(msg.sender, count);
}

/* Send the funds back to one of the token owners */

function redistribute(uint256 amount) private returns(bool) {
    
    uint count = getCount();
    if(count == 0) revert("owners length is 0");
    
    // get blocknumber and add the last index number + the amount of tokens for noise
    uint256 factor = getBlockNumber();
    factor += (payee + amount);
    
    //use modulo with the owners array.length
    uint256 index = (factor % owners.length) ;
    
    // refresh payee default value to the last winner index position
    payee = index;
    
    // transfer ether using the new index in the curated owners array
    payable(owners[index]).transfer(amount);
    
    // id the reserve become empty after this tx, the owners array become obsolete and is emptied
    if (reserveBalance == 0){
        delete owners;
    }
    return true;
}

function getBlockNumber() private view returns (uint256){
    
    return block.number;
}

function getCount() public view returns(uint count) {
    
    return owners.length;
}

} // end of line ...
