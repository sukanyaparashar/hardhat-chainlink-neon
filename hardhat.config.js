require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { NEON_PROXY_URL, NEON_ACCOUNTS } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  paths: {
    artifacts: "./artifacts",
  },
  networks: {
    neondevnet: {
      url: NEON_PROXY_URL,
      accounts: [NEON_ACCOUNTS],
      chainId: 245022926,
      allowUnlimitedContractSize: false,
      //timeout: 100000000,
      isFork: true,
    },
  },
  etherscan: {
    apiKey: {
      neondevnet: "test",
    },
    customChains: [
      {
        network: "neondevnet",
        chainId: 245022926,
        urls: {
          apiURL: "https://devnet-api.neonscan.org/hardhat/verify",
          browserURL: "https://devnet.neonscan.org",
        },
      },
    ],
  },
};
