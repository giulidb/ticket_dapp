var ParkingWallet = artifacts.require("./ParkingWallet.sol");

module.exports = function(deployer) {
  deployer.deploy(ParkingWallet);
};
