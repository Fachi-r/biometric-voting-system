const hre = require("hardhat");

async function main() {
  // Load the contract factory
  const DappVotes = await hre.ethers.getContractFactory("DappVotes");

  // Deploy the contract
  const dappVotes = await DappVotes.deploy();

  // Wait for deployment to complete (Ethers v6+)
  await dappVotes.waitForDeployment();

  console.log(`✅ DappVotes deployed to: ${dappVotes.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
