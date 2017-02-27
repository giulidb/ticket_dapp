var ShowTickets = artifacts.require("./ShowTickets.sol");

module.exports = function(deployer) {
   var ticket_price = web3.toWei(0.05,'ether');
   var event_timestamp = 1498338000; //06/24/2017 @ 9:00pm (UTC)

   deployer.deploy(ShowTickets,event_timestamp,ticket_price,'5');
};
