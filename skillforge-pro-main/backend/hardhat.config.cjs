require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Hardhat in this repo is for contracts/tests only.
// Backend runtime uses ethers.js directly (see src/services/blockchain.service.js).

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "";
// Hardhat expects raw private key strings; tolerate optional 0x prefix.
const PRIVATE_KEY = (process.env.BLOCKCHAIN_PRIVATE_KEY || "").replace(/^0x/, "");

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Generic RPC network. Use env vars to point to Polygon/Ethereum.
    rpc: {
      url: RPC_URL || "http://127.0.0.1:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
