pragma solidity ^0.4.0;

/** @title Contract for a show tickets sell  .*/
/** @author Giulia Di Bella .*/

contract ShowTickets{ 

    address public organizer;
    uint public eventTime;
    uint public ticketPrice;
    uint public numTickets;
    uint public ticketSold;
    uint public incomes;
    mapping (address => uint) ticketOf;

	
	// This means that if the organizer calls this function, the
	// function is executed and otherwise, an exception is
	// thrown.
	modifier onlyOrganizer {
		if (msg.sender != organizer)
			throw;
		_;
	}


    // This means that if a function is executed only if it's called
    // during a certain time period.
	modifier onlyBefore() { if (now >= eventTime) throw; _; }
    modifier onlyAfter() { if (now <= eventTime) throw; _; }
    
    
    // This modifier requires a certain
    // price being associated with a function call.
    // If the caller sent too much, he or she is
    // refunded, but only after the function body.
    // This was dangerous before Solidity version 0.4.0,
    // where it was possible to skip the part after `_;`.
    modifier costs(uint _amount, address addr) {
        if (msg.value < _amount)
            throw;
        _;
        if (msg.value > _amount)
            //TODO: modify this part such that a user case withdraw by hismself
           if(addr.send(msg.value - _amount))
              return;
    }


    //This means that the function will be executed
    //only if incomes > 0
    modifier onlyValue() { if (incomes > 0 ) _; else throw; }

	
	// Use of an event to pass along return values from contracts, 
	// to an app's frontend
	event TicketPayed(address _from, uint _amount, uint _id);
	event RevenueCollected(address _owner, uint _amount, uint _timestamp);
	
	
	/// This is the constructor whose code is
    /// run only when the contract is created.	
	function ShowTickets(uint _eventTime, uint _ticketPrice, uint _numTickets) {
		organizer = msg.sender;	
		eventTime = _eventTime;
 		ticketPrice = _ticketPrice;
 		numTickets = _numTickets;
		ticketSold = 0;
        incomes = 0;
	}
    

    /// Returns num of tickets still buyable
    function getLeftTickets() constant public returns(uint){
        return numTickets-ticketSold;
    }


	function buyTicket() onlyBefore costs(ticketPrice,msg.sender) public payable{
	    
       // Sending back the money by simply using
       // organizer.send(tickePrice) is a security risk
       // because it can be prevented by the caller by e.g.
       // raising the call stack to 1023. It is always safer
       // to let the recipient withdraw their money themselves.	    
       
	   if(ticketSold >= numTickets){
	       // throw ensures funds will be returned
	       throw;
	   }
	
	    ticketSold++;
	    incomes += ticketPrice;
	    ticketOf[msg.sender] = ticketSold;
	    TicketPayed(msg.sender, msg.value,ticketSold);
	    	
	}
	
	
    /// withdraw pattern fot the organizer
	function withdraw() onlyOrganizer onlyValue public returns(bool){
	    
        uint amount = incomes;
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        incomes = 0;
        if (msg.sender.send(amount)) {
            RevenueCollected(msg.sender, amount,now);
            return true;
        } else {
            incomes = amount;
            return false;
         }
    }

	
	/// closing contract and send value to its creator
	function destroy()  onlyOrganizer{
	    suicide(organizer);
		
	}
	
}