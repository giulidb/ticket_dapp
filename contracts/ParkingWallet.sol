pragma solidity ^0.4.0;

contract owned {
	address public owner;
	
	function owned() {
		owner = msg.sender; 
	}
   
	/* This contract only defines a modifier but does not use
	it - it will be used in derived contracts.
	The function body is inserted where the special symbol
	"_;" in the definition of a modifier appears.
	This means that if the owner calls this function, the
	function is executed and otherwise, an exception is
	 thrown.*/
	modifier onlyOwner {
		if (msg.sender != owner)
			throw;
		_;
	}
}

contract ParkingWallet is owned { 

    // Coins used by users for start&stop parking
	mapping (address => uint) parkingCoins;
	
	
	// use of an event is to pass along return values from contracts, 
	//to an app's frontend (reccomended!)
	event Deposit(address _from, uint _amount);
	event Transaction(address _from, address _to, uint _amount);
	event Refund(address _to, uint _amount);
	

	//constructor	
	function ParkingWallet() {
		owner = msg.sender;	
	}


	// Function to make a deposit inside the wallet	
	function deposit() public payable{
		// save value inside the wallet
		parkingCoins[msg.sender] += msg.value;
		Deposit(msg.sender,msg.value);
		
	}

/*	function buyTicket(uint amount) public returns(bool) payable{
		var addr = msg.sender;
		if( amount < parkingCoins[addr])
			throw;
		if(this.balance < amount)
			return false;
		if(!owner.send(amount))
			return false;
		parkingCoins -= amount;
		return true;*/

		
	}
	
	// return user's balance
		function getBalance(address addr) returns(uint) {
		return parkingCoins[addr];
	}
	
	
	// without this funds could be locked in the contract forever!
	function destroy()  onlyOwner{
		suicide(owner);
		
	}
	
}
