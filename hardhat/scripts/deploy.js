const { ethers } = require("hardhat")
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants")

async function main() {
  const nftContractFactory = await ethers.getContractFactory("CryptoDevs")
  const nftContract = await nftContractFactory.deploy(
    METADATA_URL,
    WHITELIST_CONTRACT_ADDRESS
  )
  await nftContract.deployed()
  console.log("CryptoDevs Contract Address: ", nftContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
