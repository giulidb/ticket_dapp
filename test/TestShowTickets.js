var ShowTickets = artifacts.require("./ShowTickets.sol");

contract('ShowTickets',function(accounts){
    
    console.log(accounts);
    // Take available accounts
    var organizer_account = accounts[0];
    var customer_account = accounts[1];


	// First Test to check if the contract will be initialized with the correct info
    it("Contructor Test", function(done) {
		console.log("First Test starts");

		ShowTickets.deployed().then(
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
						contract.numTickets.call().then(
							function(num){
								console.log("Initial num of tickets: " + num);
								assert.equal(num, 150, "Doesn't match!");
								contract.ticketPrice.call().then(
									function(price){
								  		var ticket_price = web3.toWei(0.05,'ether');
									 	console.log("Initial price of tickets: " + price);
							         	assert.equal(price, ticket_price, "Doesn't match!");
								}).then(
									function(){
									 	return contract.eventTime.call();
									}).then(
										function(timestamp){
									    	var event_timestamp = 1498338000; //06/24/2017 @ 9:00pm (UTC)
											console.log("Event time: " + timestamp + ": 06/24/2017 @ 9:00pm (UTC)");
							         		assert.equal(timestamp, event_timestamp, "Doesn't match!");
											return contract.incomes.call(); 
										}).then(
												function(income){	
													console.log("Initial Organizer incomes: " + income);
									         		assert.equal(income,0, "Doesn't match!");
													done(); 
												}
										).catch(done);
				
							}).catch(done);
				});
			});
		console.log("First Test ends");
		});


		// Second Test to check buy a Ticket (transaction send)
		// Send the exactly value 
		it("Should let you to but a Ticket", function(done) {
        	console.log("Second Test starts");
			ShowTickets.deployed().then(
				function(contract){
				
					// Ether has a lot of denominations and the one normally used in contracts is Wei,
					// the smallest. Web3.js provides convenience methods for converting ether to/from Wei
					var amount = web3.toWei(.05,'ether');
				
					// getBalance: Get the balance of an address at a given block, return a big number
					var initialBalance =  web3.eth.getBalance(contract.address).toNumber();
					var buyerBalance = web3.eth.getBalance(customer_account).toNumber();
					console.log("Contract's initial Balance: " + initialBalance);
					console.log("Buyer's initial Balance: " + buyerBalance);

					// call the function that is actually a transaction
					contract.buyTicket({from: customer_account, value: amount}).then(
						function(){
							//contract's new balance
							var Balance =  web3.eth.getBalance(contract.address).toNumber();
							var buyerBalance_after = web3.eth.getBalance(customer_account).toNumber();
							console.log("Contract's Balance after a ticket sell : " + Balance);
							console.log("Buyer's Balance after a ticket bought : " + buyerBalance);
							var diff = Balance - initialBalance;
							var diff2 =  buyerBalance-buyerBalance_after;
							console.log("Diff : " + diff2);
							assert.equal(diff, amount, "Doesn't match!");
							return contract.ticketSold.call();
						}).then(
							function(num){
								console.log("Num Ticket Sold : " + num);
								assert.equal(num, 1, "Doesn't match!");
								return contract.getLeftTickets.call();
							}).then(
									function(ticket_left){
										console.log("Num Ticket Left : " + ticket_left);
										assert.equal(ticket_left, 149, "Doesn't match!");	
										return contract.incomes.call(); 
									}).then(
										function(income){	
											console.log("Organizer incomes: " + income);
									        assert.equal(income,amount, "Doesn't match!");
											done(); 
												}
										)
									.catch(done);
				}).catch(done);
              console.log("Second Test ends");
		})
	
		
		// Third Test to check buy a Ticket (transaction send)
		// Send a value less than ticket price 
		it("Should not let you to but a Ticket", function(done) {
        	console.log("Third Test starts");
			ShowTickets.deployed().then(
				function(contract){
				
					// Ether has a lot of denominations and the one normally used in contracts is Wei,
					// the smallest. Web3.js provides convenience methods for converting ether to/from Wei
					var amount = web3.toWei(.03,'ether');
				
					// getBalance: Get the balance of an address at a given block, return a big number
					var initialBalance =  web3.eth.getBalance(contract.address).toNumber();
					var buyerBalance = web3.eth.getBalance(customer_account).toNumber();
					console.log("Contract's initial Balance: " + initialBalance);
					console.log("Buyer's initial Balance: " + buyerBalance);

					// call the function that is actually a transaction
					// should fail
					contract.buyTicket({from: customer_account, value: amount}).then(
						function(){
							//contract's new balance
							var Balance =  web3.eth.getBalance(contract.address).toNumber();
							var buyerBalance_after = web3.eth.getBalance(customer_account).toNumber();
							console.log("Contract's Balance after a ticket sell : " + Balance);
							console.log("Buyer's Balance after a ticket bought : " + buyerBalance);
							var diff = Balance - initialBalance;
							var diff2 =  buyerBalance-buyerBalance_after;
							console.log("Diff : " + diff2);
							assert.equal(diff, amount, "Doesn't match!");
							return contract.ticketSold.call();
						}).then(
							function(num){
								console.log("Num Ticket Sold : " + num);
								assert.equal(num, 1, "Doesn't match!");
								return contract.getLeftTickets.call();
							}).then(
									function(ticket_left){
										console.log("Num Ticket Left : " + ticket_left);
										assert.equal(ticket_left, 149, "Doesn't match!");
										done();	
									}).catch(done);
				}).catch(done);
              console.log("Third Test ends");
		})


		// Forth Test to check buy a Ticket (transaction send)
		// Send a value more than ticket price 
		it("Should let you to but a Ticket", function(done) {
        	console.log("Forth Test starts");
			ShowTickets.deployed().then(
				function(contract){
				
					// Ether has a lot of denominations and the one normally used in contracts is Wei,
					// the smallest. Web3.js provides convenience methods for converting ether to/from Wei
					var amount = web3.toWei(.10,'ether');
				
					// getBalance: Get the balance of an address at a given block, return a big number
					var initialBalance =  web3.eth.getBalance(contract.address).toNumber();
					var buyerBalance = web3.eth.getBalance(customer_account).toNumber();
					console.log("Contract's initial Balance: " + initialBalance);
					console.log("Buyer's initial Balance: " + buyerBalance);

					// call the function that is actually a transaction
					// should work
					contract.buyTicket({from: customer_account, value: amount}).then(
						function(){
							//contract's new balance
							var Balance =  web3.eth.getBalance(contract.address).toNumber();
							var buyerBalance_after = web3.eth.getBalance(customer_account).toNumber();
							console.log("Contract's Balance after a ticket sell : " + Balance);
							console.log("Buyer's Balance after a ticket bought : " + buyerBalance_after);
							var diff2 =  buyerBalance-buyerBalance_after;
							console.log("Diff : " + diff2);
							var diff = Balance - initialBalance;
							//assert.equal(diff, amount, "Doesn't match!");
							return contract.ticketSold.call();
						}).then(
							function(num){
								console.log("Num Ticket Sold : " + num);
								assert.equal(num, 2, "Doesn't match!");
								return contract.getLeftTickets.call();
							}).then(
									function(ticket_left){
										console.log("Num Ticket Left : " + ticket_left);
										assert.equal(ticket_left, 148, "Doesn't match!");
										done();	
									}).catch(done);
				}).catch(done);
              console.log("Forth Test ends");
		})


		// Fifth Test to check withdraw (transaction send)
		it("Should let you to but a Ticket", function(done) {
        	console.log("Fifth Test starts");
			ShowTickets.deployed().then(
				function(contract){
				
					// Ether has a lot of denominations and the one normally used in contracts is Wei,
					// the smallest. Web3.js provides convenience methods for converting ether to/from Wei
					var amount = web3.toWei(.05,'ether');
				
					// getBalance: Get the balance of an address at a given block, return a big number
					var initialBalance =  web3.eth.getBalance(contract.address).toNumber();
					var buyerBalance = web3.eth.getBalance(customer_account).toNumber();
					console.log("Contract's initial Balance: " + initialBalance);
					console.log("Buyer's initial Balance: " + buyerBalance);

					// call the function that is actually a transaction
					// should work
					contract.buyTicket({from: customer_account, value: amount}).then(
						function(){
							//contract's new balance
							var Balance =  web3.eth.getBalance(contract.address).toNumber();
							console.log("Contract's Balance after a ticket sell : " + Balance);
							return contract.incomes.call();
						}).then(
							function(income){
								console.log("Organizer incomes after buy ticket: " + income);
								var inc = amount*3
								assert.equal(income, inc , "Doesn't match!");
								return contract.withdraw({from:organizer_account});
							}).then(
									function(){
										return contract.incomes.call();
									}).then(
											function(incom){
												var finalBalance =  web3.eth.getBalance(contract.address).toNumber();
												console.log("Contract's Balance after a withdraw : " + finalBalance);
												console.log("Organizer incomes after withdraw: " + incom);
												assert.equal(incom, 0 , "Doesn't match!");		
												done();
											}
									).catch(done);
				}).catch(done);
              console.log("Fifth Test ends");
		})


});
