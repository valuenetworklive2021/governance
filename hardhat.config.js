require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
const { mnemonic, apiKey } = require('./secrets.json');



module.exports = {
  solidity: {
    version: '0.5.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
  etherscan: {
    apiKey: apiKey.etherscan,
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    mainnet: {
      // https://hardhat.org/config/#json-rpc-based-networks
      url: `https://eth-mainnet.alchemyapi.io/v2/${apiKey.mainnet}`,
      chainId: 1,
      accounts: {
        mnemonic,
      },
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${apiKey.ropsten}`,
      chainId: 3,
      accounts: {
        mnemonic,
      },
    },
    kovan: {
      url: `https://eth-kovan.alchemyapi.io/v2/${apiKey.ropsten}`,
      chainId: 42,
      accounts: {
        mnemonic,
      },
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${apiKey.ropsten}`,
      chainId: 4,
      accounts: {
        mnemonic,
      },
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${apiKey.ropsten}`,
      chainId: 5,
      accounts: {
        mnemonic,
      },
    },
  },
};
