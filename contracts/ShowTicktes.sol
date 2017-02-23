pragma solidity ^0.4.0;

/** @title Contract for a show tickets sell  .*/
/** @author Giulia Di Bella .*/

contract ShowTickets{ 

    address public organizer;
    uint eventTime;
    uint ticketPrice;
    uint numTickets;
    uint ticketSold;
    uint incomes;
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
    // fee being associated with a function call.
    // If the caller sent too much, he or she is
    // refunded, but only after the function body.
    // This was dangerous before Solidity version 0.4.0,
    // where it was possible to skip the part after `_;`.
    modifier costs(uint _amount) {
        if (msg.value < _amount)
            throw;
        _;
        if (msg.value > _amount)
            if(msg.sender.send(msg.value - _amount))
               throw;
    }

	
	// Use of an event to pass along return values from contracts, 
	// to an app's frontend (reccomended!)
	event TicketPayed(address _from, uint _amount);
	event Revenue(address _to, uint _amount);
	
	
	/// This is the constructor whose code is
    /// run only when the contract is created.	
	function ShowTickets(uint _eventTime, uint _ticketPrice, uint _numTickets) {
		organizer = msg.sender;	
		eventTime = _eventTime;
		ticketPrice = _ticketPrice;
		numTickets = _numTickets;
		ticketSold = 0;
	}


	function buyTicket() onlyBefore public payable costs(ticketPrice){
	    
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
	    TicketPayed(msg.sender, msg.value);
	    	
	}
	
	
	function withdraw() onlyOrganizer public returns(bool){
	    
        uint amount = incomes;
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        incomes = 0;
        if (msg.sender.send(amount)) {
            Revenue(msg.sender, amount);
            return true;
        } else {
            incomes = amount;
            return false;
        }
    }

	
	/// without this funds could be locked in the contract forever!
	function destroy()  onlyOrganizer{
	    suicide(organizer);
		
	}
	
}