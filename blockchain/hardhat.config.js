/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();

const { API_URL, API_KEY , PRIVATE_KEY} = process.env;

module.exports = {
  solidity: '0.8.21',
  networks: {
    hardhat: {},
    polygon: {
      url:  "https://rpc-mumbai.maticvigil.com",
      accounts: ['0xeb548cd9aabc79392d5b01ff8b6d74168cfe99a8e370c03eb0aa466f87bb77cb'],
      //gasPrice: 225000000000,
    },
  },
  etherscan: {
    apiKey: 'CTZ7FPH21A754TIR576BZJRRGM8YCCU19W',
  },
};

