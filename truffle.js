// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },

     "ropsten": {       // Official Ethereum test network
      host: 'localhost',
      port: 8546,
      network_id: 3,
      from: "0x0079a5694b0cfa818d9fb01f9a24997c2693e245"
    },

    "staging": {
    network_id: 1900, // custom private network
    host: 'localhost',
    port: 8545
    // use default rpc settings
    }
    
  }
}
