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
    neonlabs: {
      url: NEON_PROXY_URL,
      accounts: [NEON_ACCOUNTS],
      chainId: 245022926,
      allowUnlimitedContractSize: false,
      //timeout: 100000000,
      isFork: true,
    },
  },
};
