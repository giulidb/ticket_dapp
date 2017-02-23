var ShowTickets = artifacts.require("./ShowTickets.sol");

contract('ShowTickets',function(accounts){
    
    	console.log(accounts);
        // Take available accounts
        var organizer_account = accounts[0];
        var customer_account = accounts[1];
	

	// First Test to check if the contract will be initialized with the correct info
        it("Contructor Test", function(done) {
  	
	// constructor	
  	ShowTickets.new({from: organizer_account}).then(
  		function(contract) {
			
			/*call: use this to check the values of variables (defined as public) as in contract.organizer.call().
			or with an argument like call(0) to call a mapping and get index 0. 
			1. not mined and so 
			2. doesn't have to be from an account/wallet(not signed with an account holder's private keys)
  			*/
			
			contract.organizer.call().then(
  				function(organizer) { 
					console.log("organizer address: "+organizer);
					//assert: standard JS testing assertion, Chai documentation
					assert.equal(organizer, organizer_account, "Doesn't match!");					
  			}).then( 
				function(){
					/*contract.getBalance.call(customer_account,{from: customer_account}).then(
						function(balance){
							console.log("User initial balance: "+balance);
							assert.equal(balance, 0, "Doesn't match!");
							done();
						}
					).catch(done);*/
					done();
				
				}
					).catch(done);
		console.log("End First Test");

		});
	});
	
	/*
	//Second Test to check call a fuction
	  it("Should let you change quota", function(done) {
		  ShowTickets.new({from: organizer_account}).then(
			function(contract){
					contract.quota.call().then(
				function(quota){
					console.log("Quota "+quota.toNumber());
					assert.equal(quota, 50, "Doesn't match!");						
					}		
					).then(
						function(){
							// call a function (public)
							return contract.change_quota(350,{from: organizer_account});
						}					
					).then(
							function(result){
								// printed will be a long hex, the transaction hash
								console.log(result);
								return contract.quota.call();
								}
						).then(
								function(quota){
									console.log("Quota "+quota.toNumber());
									assert.equal(quota, 350, "Doesn't match!");
									done();	
									
								}).catch(done);
			}).catch(done);								
		  });
		  
	

		// Third Test to check buy a Ticket (transaction send)
		  it("Should let you to make a deposit", function(done) {
			  ShowTickets.new({from:organizer_account}).then(
				function(contract){
					
					// Ether has a lot of denominations and the one normally used in contracts is Wei,
					// the smallest. Web3.js provides convenience methods for converting ether to/from Wei
					
					var amount = web3.toWei(.05,'ether');
					
					// getBalance: Get the balance of an address at a given block, return a big number
					
					var initialBalance =  web3.eth.getBalance(contract.address).toNumber();
					console.log("Initial Balance: "+initialBalance);
					
					// call the function that is actually a transaction
					contract.deposit({from: customer_account, value: amount}).then(
					
						function(){
							contract.getBalance.call(customer_account,{from: customer_account}).then(
							function(balance){
							console.log("User balance: "+balance);
							assert.equal(balance, amount, "Doesn't match!");
							done();
							}
							).catch(done);}								
									
								
								).catch(done);
					}
			  
			  
			  
			  
			  
			  
			  ).catch(done);
			  
			})
			

		 
			  
		//Fourth test for sending a transaction
		it("Should issue a refund by organizer only", function(done){

			ShowTickets.new({from: organizer_account}).then(
				function(contract){
					var amount = web3.toWei(0.5,'ether');
					var initialBalance = web3.eth.getBalance(contract.address).toNumber();
					contract.buyTicket({from: customer_account, value: amount}).then(
						
					function(){
						var newBalance = web3.eth.getBalance(contract.address).toNumber();
						
						//try to refund a ticket as user - shoul fail
						//return contract.refund(customer_account,amount,{from: customer_account});
						}
					
					
					).then(
						function(){
							var balance = web3.eth.getBalance(contract.address).toNumber();
							//You will always get a BigNumber object for number values as JavaScript is not able
                            //to handle big numbers correctly.
							assert.equal(web3.toBigNumber(balance),amount,"Balance should be unchanged");
						
							//try to refund a ticket as organizer - should work
							return contract.refund(customer_account, amount, {from: organizer_account});
							}
						).then(
							function(){
									
									var postRefundBalance = web3.eth.getBalance(contract.address).toNumber();
									assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");
									done();
								}
							
							
							).catch(done);

					}).catch(done);
			
			
			
			});		*/		



});


