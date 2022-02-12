require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("./tasks/PrintAccounts");
require("dotenv").config();

const KOVAN_NODE = process.env.KOVAN_NODE;
const PRV_KEY = process.env.PRV_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    mainnet_fork: {
      url: process.env.MAINNET_PROVIDER_URL,
    },
    localhost: {
      url: `http://localhost:8545`,
      timeout: 150000,
    },
    kovan: {
      url: KOVAN_NODE,
      accounts: [PRV_KEY],
    },
    /* rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
      accounts: [privateKey1, privateKey2, ...]
    } */
  },
  /* etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: BSCSCAN_API_KEY,
  }, */
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.2",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 50000,
  },
};
