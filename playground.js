const Web3 = require("web3");
const fs = require("fs");

require("dotenv").config();
const { ORACLE_ADDRESS, ROUND } = process.env;

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://devnet.neonevm.org/")
);

const contractJson = fs.readFileSync(
  "./artifacts/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json"
);
const contractABI = JSON.parse(contractJson);

const contract = new web3.eth.Contract(contractABI.abi, ORACLE_ADDRESS);

contract.methods
  .version()
  .call()
  .then((version) => {
    console.log("version:", version);
  });
contract.methods
  .description()
  .call()
  .then((description) => {
    console.log("description:", description);
  });
contract.methods
  .decimals()
  .call()
  .then((decimals) => {
    console.log("decimals:", decimals);
  });
contract.methods
  .latestRoundData()
  .call()
  .then(({ roundId, answer, startedAt, updatedAt, answeredInRound }) => {
    console.log("latestRoundData:", {
      roundId,
      answer,
      startedAt,
      updatedAt,
      answeredInRound,
    });
  });

contract.methods
  .getRoundData(ROUND)
  .call()
  .then(({ roundId, answer, startedAt, updatedAt, answeredInRound }) => {
    console.log("getRoundData:", {
      roundId,
      answer,
      startedAt,
      updatedAt,
      answeredInRound,
    });
  })
  .catch(console.log);
