// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI = 1_000_000_000n;

module.exports = buildModule("VotingModule", (m) => {
  const voting = m.contract("Voting", [["0xaD0f45e7202e654d42411D4D6160bf061cF74c92"],["Alice","Bob","Charlie"]]);
  return {voting};
});

