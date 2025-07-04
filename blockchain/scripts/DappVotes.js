const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const DappVotes = await hre.getContractFactory("DappVotes");

  // Deploy the contract
  const dappVotes = await DappVotes.deploy();
  await dappVotes.deployed();

  console.log(`✅ DappVotes deployed to: ${dappVotes.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
