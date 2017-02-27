// Import the page's CSS. 
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ShowTickets_artifacts from '../../build/contracts/ShowTickets.json'

// ShowTickets is our usable abstraction, which we'll use through the code below.
var ShowTickets = contract(ShowTickets_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var organizer_account;
var customer_account;
var contract_instance;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the ShowTickets abstraction for Use.
    ShowTickets.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      customer_account = accounts[1];

       ShowTickets.deployed().then(function(instance) {
       var organizer_address = document.getElementById("contractAddress");
       organizer_address.innerHTML = instance.address;
      
    }).catch(function(e){
         console.log(e);
         self.setStatus("Error getting contract's address; see log.");

       });
        

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

 refreshBalance: function() {
    var self = this;
    var contract;
    ShowTickets.deployed().then(function(instance) {
      contract = instance;
      console.log("user address: "+ customer_account);
      return contract.organizer.call();
    }).then(function(value) {
      var organizer_address = document.getElementById("organizer");
      organizer_address.innerHTML = value.valueOf();
      contract.getTickets.call().then(
          function(numTickets){
              var ticketsLeft = document.getElementById("numTickets");
              ticketsLeft.innerHTML = numTickets.valueOf();
          }

      ).catch(function(e){
            console.log(e);
            self.setStatus("Error getting values; see log.");
      });
      
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting values; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    amount = web3.toWei(amount,'ether');
    //var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var contract;
    ShowTickets.deployed().then(function(instance) {
      contract = instance;
      return contract.deposit({from: customer_account, value: amount});
    }).then(function(result) {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
      
      // result is an object with the following values:
      // result.tx      => transaction hash, string
      // result.logs    => array of decoded events that were triggered within this transaction
      // result.receipt => transaction receipt object, which includes gas used

      // We can loop through result.logs to see if we triggered the Transfer event.
      for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];
      if (log.event == "Deposit") {
          console.log("Event: "+log.event);
        break;
       }
  }


    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/contractMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 ShowTickets, ensure you've configured that source properly. If using contractMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-contractmask")
    // Use Mist/contractMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to contractmask for development. More info here: http://truffleframework.com/tutorials/truffle-and-contractmask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
