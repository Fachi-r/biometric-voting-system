const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying DappVotes contract...");

  // Deploy the contract
  const DappVotes = await hre.ethers.getContractFactory("DappVotes");
  const dappVotes = await DappVotes.deploy();

  await dappVotes.waitForDeployment();

  const contractAddress = await dappVotes.getAddress();
  console.log("DappVotes deployed to:", contractAddress);

  // Get the contract ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/DappVotes.sol/DappVotes.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  // Create the contracts directory in src if it doesn't exist
  const contractsDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Write contract address and ABI to frontend
  const contractData = {
    address: contractAddress,
    abi: abi
  };

  fs.writeFileSync(
    path.join(contractsDir, "DappVotes.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract ABI and address saved to src/contracts/DappVotes.json");
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Start the frontend: npm run dev");
  console.log("2. Connect MetaMask to Hardhat network");
  console.log("3. Import a test account from Hardhat node");
  console.log("4. Start creating polls and voting!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });