require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
  solidity: "0.8.4",
  networks: {
    mumbai: {
      url: ALCHEMY_API_URL,
      accounts: [PRIVATE_KEY],
    },
  },
}
