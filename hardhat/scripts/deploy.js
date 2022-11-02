const { ethers } = require("hardhat")

async function main() {
  const whitelistContractFactory = await ethers.getContractFactory("Whitelist")
  const whitelistContract = await whitelistContractFactory.deploy(10)
  await whitelistContract.deployed()
  console.log("Whitelist Contract Address: ", whitelistContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => console.error(error))
