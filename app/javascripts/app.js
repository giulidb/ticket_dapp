// Import the page's CSS. 
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ParkingWallet_artifacts from '../../build/contracts/ParkingWallet.json'

// ParkingWallet is our usable abstraction, which we'll use through the code below.
var ParkingWallet = contract(ParkingWallet_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var organizer_account;
var customer_account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the ParkingWallet abstraction for Use.
    ParkingWallet.setProvider(web3.currentProvider);

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
    ParkingWallet.deployed().then(function(instance) {
      contract = instance;
      console.log("user address: "+ customer_account);
      return contract.getBalance.call(customer_account, {from: customer_account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
      contract.owner.call().then(
        function(owner){
          console.log("owner address: "+owner);
        }

      ).catch(function(e){
          console.log(e);
            });
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    //var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var contract;
    ParkingWallet.deployed().then(function(instance) {
      contract = instance;
      return contract.deposit({from: customer_account, value: amount});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/contractMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 ParkingWallet, ensure you've configured that source properly. If using contractMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-contractmask")
    // Use Mist/contractMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to contractmask for development. More info here: http://truffleframework.com/tutorials/truffle-and-contractmask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});