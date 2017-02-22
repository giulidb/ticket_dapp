pragma solidity ^0.4.0;


/** @title Parking wallet contract .*/
contract ParkingWallet{ 

   address public owner;
   
    // Coins used by users for start&stop parking
	mapping (address => uint) balances;
	
	// Parking tickets
	struct ParkingTicket{
	    address renter;
	    uint duration;
	}
	
	// Parking area
	struct ParkingArea{
	    uint ticketPricehour;
	    ParkingTicket[] tickets;
	}
	
	ParkingArea[] parking;
	
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
	
	// Use of an event  to pass along return values from contracts, 
	// to an app's frontend (reccomended!)
	event Deposit(address _from, uint _amount);
	event Transfer(address _from, address _to, uint _amount);
	event Refund(address _to, uint _amount);
	

	/// This is the constructor whose code is
    /// run only when the contract is created.	
	function ParkingWallet() {
		owner = msg.sender;	
		//TODO: data structure initialization
		
	}


	/// Function to make a deposit inside the wallet	
	function deposit() public payable{
		// save value inside the wallet
		balances[msg.sender] += msg.value;
		Deposit(msg.sender,msg.value);
		
	}

	function buyTicket(uint amount) public{
	    
    // Sending back the money by simply using
    // owner.send(amount) is a security risk
    // because it can be prevented by the caller by e.g.
    // raising the call stack to 1023. It is always safer
    // to let the recipient withdraw their money themselves.	    

		var addr = msg.sender;
		if( amount < balances[addr]){
    		balances[addr]  -= amount;
	        balances[owner] += amount;
	        Transfer(addr, owner, amount);
	        
	        //TODO: buy the ticket actions
	        
		    }
		
	}
	
	/// called by users if they want to take monwy wallet back
	/// and by the parking owner to collect his funds
	function collection() public returns(bool){
	    
	    var amount = balances[msg.sender];
	    if (amount > 0){
	        // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            balances[msg.sender] = 0;
	    }
	    
	    if(!msg.sender.send(amount)){
            // No need to call throw here, just reset the amount owing
	        balances[msg.sender] = amount;
	        return false;
	    }
	    
	    Refund(msg.sender,amount); // Triggering event
	    return true;
	}
	
	
	/// return user's balance
		function getBalance(address addr) returns(uint) {
		return balances[addr];
	}
	
	
	/// without this funds could be locked in the contract forever!
	function destroy()  onlyOwner{
	    //TODO: refund costumer before kill the contract
		suicide(owner);
		
	}
	
}