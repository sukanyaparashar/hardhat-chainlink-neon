// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require("dotenv").config();
const { FEED_ADDRESS } = process.env;

async function main() {
  // Library deployment
  const Utils = await hre.ethers.getContractFactory("Utils");
  const utils = await Utils.deploy();
  await utils.deployed();
  console.log("Utils Library Address--->" + utils.address);

  // Contract deployment
  const ChainlinkOracle = await hre.ethers.getContractFactory(
    "ChainlinkOracle",
    {
      libraries: {
        Utils: utils.address,
      },
    }
  );
  const chainlinkOracle = await ChainlinkOracle.deploy(FEED_ADDRESS);
  await chainlinkOracle.deployed();
  console.log("Chainlink Oracle Address--->" + chainlinkOracle.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
