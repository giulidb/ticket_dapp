// Import the page's CSS. 
import "../stylesheets/app.css";

// Import libraries.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ShowTickets_artifacts from '../../build/contracts/ShowTickets.json'

// ShowTickets is an usable abstraction.
var ShowTickets = contract(ShowTickets_artifacts);

var accounts;
var myAddr;
var ticket_amount;
var PaymentEvent;
var CheckinEvent;
var CollectEvent;
var numTickets;
var buyers = [];
var tickets = [];
var select;
var logs;
var index;

// rospsten var contract_address = '0xc865076cE075D692ED5A2F3Cc21bF20b57ecD7e3';
var contract_address = '0x229aaf003bdbccdd15708f4588ea300ec76e103b';
window.App = {
  start: function() {
    var self = this;

    console.log("Dapp Initialization");
    // Bootstrap the ShowTickets abstraction for Use.
    ShowTickets.setProvider(web3.currentProvider);

    // Get the initial account so it can be displayed.
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
      myAddr = accounts[3];
      console.log(accs);

      //document.getElementById("buyer").value = accounts[1].toString();
      select = document.getElementById("select_use");
      logs = document.getElementById("logs");

       //ShowTickets.deployed()
       // ShowTickets.at('0x229aaf003bdbccdd15708f4588ea300ec76e103b')
       ShowTickets.deployed().then(function(instance) {


           console.log("Contract's parameter: ");          
           // Get contract's addr 
           var contract_address = document.getElementById("contractAddress");
           contract_address.innerHTML = instance.address;

           //Get Account addr
           var my_address =  document.getElementById("myAddress");
           my_address.innerHTML = myAddr;

           //Get Event date
          
           // Start watching events
          PaymentEvent = instance.TicketPayed(
              function(error, log){
                  if (!error){
                    console.log(log);
                    self.setStatus("User with address: " + log.args._from.valueOf()  
                                   + " bought ticket num: " + log.args._id.valueOf() 
                                   + " at time: " + new Date(log.args._timestamp.valueOf()*1000));

                    ShowTickets.deployed().then(function(instance) {
                      var contract = instance;
                      console.log("inside event");
                      return contract.getTicket.call(myAddr);
                  }).then(function(value) {
                     var opt = document.createElement('option');
                             opt.value = 1;
                             console.log(value);
                             if(value[0] != 0 && value[1] == false){
                                opt.innerHTML = "Num: " + value.valueOf();
                                select.appendChild(opt);}      
                }).catch(function(e) {
                    console.log(e);
                    self.setStatus("Error getting values; see log.");
                });                

                    self.refreshValues();
                    buyers.push(log.args._from.valueOf());   
                    
                
                }else
                    console.log(error);   
              });

           CheckinEvent = instance.Checkin( 
              function(error, log){
                  if (!error){
                    console.log(log);                    
                    self.setStatus("User with address: " + log.args.user.valueOf()
                                   + " used a ticket at time: " + new Date(log.args._timestamp.valueOf()*1000));   
                    select.options.remove(index);
                    self.refreshValues();
                               
                }else
                    console.log(error);   
              }); 

           CollectEvent = instance.RevenueCollected( 
              function(error, log){
                  if (!error){
                    console.log(log);                    
                    self.setStatus("Organizer with address: " + log.args._owner.valueOf()
                                   + " has collected the whole contract's balance: " + log.args._amount.valueOf()
                                   + " at time: " + new Date(log.args._timestamp.valueOf()*1000));   
                    self.refreshValues();                               
                }else
                    console.log(error);   
              });        

           // Get ticket's price 
           return instance.ticketPrice.call();
           }).then(function(ticket_price){
                  var price = document.getElementById("ticket_price");
                  ticket_amount = ticket_price.valueOf()
                  console.log(ticket_amount);
                  price.innerHTML = web3.fromWei(ticket_amount,'ether');
                }).catch(function(e){
                  console.log(e);
                  self.setStatus("Error getting parameters; see log.");
                 });					var amount = web3.toWei(.05,'ether');

          

      self.refreshValues();
    });
  },

  setStatus: function(message) {
    var logs = document.getElementById("logs");
    logs.innerHTML = message;
  },

  showMessage: function(message){
    console.log(message);
    alert(message);
  },
  
 refreshValues: function(){
    console.log("Refresh Values");
    var self = this;
    var contract;

      // console.log("Last block: "+  web3.eth.blockNumber + " Timestamp: " + new Date(web3.eth.getBlock(web3.eth.blockNumber).timestamp));
   // ShowTickets.deployed()
   // ShowTickets.at(contract_address)
    ShowTickets.deployed().then(function(instance) {
      contract = instance;
      web3.eth.getBalance(instance.address,function(error, result) {
          var contract_balance = document.getElementById("balance");
          contract_balance.innerHTML = web3.fromWei(result.toNumber(),"ether");
        });
         web3.eth.getBalance(myAddr,function(error, myresult) {
          var my_balance = document.getElementById("mybalance");
          console.log("my balance: "+ myresult);
          my_balance.innerHTML = web3.fromWei(myresult.toNumber(),"ether");;
        });
      return contract.organizer.call();
    }).then(function(value) {
      var organizer_address = document.getElementById("organizer");
      organizer_address.innerHTML = value.valueOf();
      contract.getLeftTickets.call().then(
          function(_numTickets){
              var ticketsLeft = document.getElementById("numTickets");
              ticketsLeft.innerHTML = _numTickets.valueOf();
              numTickets = _numTickets.valueOf();
              contract.eventTime.call().then(
                function(date){
                    var date_el = document.getElementById("date");
                    date_el.innerHTML = new Date(date*1000);});
                  
             
          }).catch(function(e){
             console.log(e);
              self.setStatus("Error getting values; see log.");
      });
      
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting values; see log.");
    });
  },

  buy: function() {
    
    var self = this;
    if(numTickets == 0){
      self.showMessage("Tickets for this show are finished!");
      return;
    }
    for(var i = 0; i < buyers.length; i++){
      if(buyers[i] == myAddr){
         self.showMessage("You already have a ticket for this show");
         return;
      }
    }
    this.setStatus("Initiating transaction... (please wait)");
    console.log("Buy function");
    var contract;
    //ShowTickets.deployed()
    // ShowTickets.at(contract_address)
    ShowTickets.deployed().then(function(instance) {
      contract = instance;
      
      return contract.buyTicket({from: myAddr, value: ticket_amount});
    }).then(function(result) {
        self.setStatus("Transaction complete! Please wait for block creation...");
        tickets.push(myAddr);
      }).catch(function(e) {
      console.log(e);
      self.setStatus("Error buying ticket; see log.");
    });
  },

  use: function(){
      var self = this;
      this.setStatus("Initiating transaction... (please wait)");
      console.log("Use function");
      var contract;
      index = select.options.selectedIndex
            //ShowTickets.deployed()
      //ShowTickets.at(contract_address)
      ShowTickets.deployed().then(function(instance) {
      contract = instance;
      return contract.checkin({from: myAddr});
             }).then(
                  function(result) {
                   self.setStatus("Transaction complete! Please wait for block creation...");
                  }).catch(
                          function(e) {
                              console.log(e);
                              self.setStatus("Error use ticket; see log.");
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
