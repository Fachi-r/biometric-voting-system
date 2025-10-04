const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎧 Starting blockchain event listener...\n");

  // Load contract data
  const contractDataPath = path.join(__dirname, "../src/contracts/DappVotes.json");
  
  if (!fs.existsSync(contractDataPath)) {
    console.error("❌ Contract not deployed! Please run: npx hardhat run scripts/deploy.js --network localhost");
    process.exit(1);
  }

  const contractData = JSON.parse(fs.readFileSync(contractDataPath, "utf8"));
  const contractAddress = contractData.address;
  const abi = contractData.abi;

  console.log(`📡 Connecting to DappVotes contract at: ${contractAddress}\n`);

  // Get contract instance
  const DappVotes = await hre.ethers.getContractAt("DappVotes", contractAddress);

  console.log("✅ Connected! Listening for events...\n");
  console.log("=".repeat(80));
  console.log("\n");

  // Listen for VoterRegistered events
  DappVotes.on("VoterRegistered", (voterAddress, voterId, name, fingerprintId) => {
    console.log("\n" + "=".repeat(80));
    console.log("✅ VOTER REGISTERED");
    console.log("=".repeat(80));
    console.log(`👤 Name:           ${name}`);
    console.log(`🆔 Voter ID:       ${voterId.toString()}`);
    console.log(`💳 Wallet:         ${voterAddress}`);
    console.log(`👆 Fingerprint ID: ${fingerprintId.toString()}`);
    console.log("=".repeat(80) + "\n");
  });

  // Listen for PollCreated events
  DappVotes.on("PollCreated", (pollId, director, title) => {
    console.log("\n" + "=".repeat(80));
    console.log("📢 POLL CREATED");
    console.log("=".repeat(80));
    console.log(`🆔 Poll ID:    ${pollId.toString()}`);
    console.log(`📝 Title:      ${title}`);
    console.log(`👤 Director:   ${director}`);
    console.log("=".repeat(80) + "\n");
  });

  // Listen for PollUpdated events
  DappVotes.on("PollUpdated", (pollId, title) => {
    console.log("\n" + "=".repeat(80));
    console.log("✏️  POLL UPDATED");
    console.log("=".repeat(80));
    console.log(`🆔 Poll ID:    ${pollId.toString()}`);
    console.log(`📝 New Title:  ${title}`);
    console.log("=".repeat(80) + "\n");
  });

  // Listen for PollDeleted events
  DappVotes.on("PollDeleted", (pollId) => {
    console.log("\n" + "=".repeat(80));
    console.log("🗑️  POLL DELETED");
    console.log("=".repeat(80));
    console.log(`🆔 Poll ID:    ${pollId.toString()}`);
    console.log("=".repeat(80) + "\n");
  });

  // Listen for ContestantAdded events
  DappVotes.on("ContestantAdded", (pollId, contestantId, account, name) => {
    console.log("\n" + "=".repeat(80));
    console.log("👤 CANDIDATE ADDED");
    console.log("=".repeat(80));
    console.log(`🆔 Candidate ID: ${contestantId.toString()}`);
    console.log(`📝 Name:         ${name}`);
    console.log(`📊 Poll ID:      ${pollId.toString()}`);
    console.log(`💳 Wallet:       ${account}`);
    console.log("=".repeat(80) + "\n");
  });

  // Listen for VoteCast events
  DappVotes.on("VoteCast", (pollId, contestantId, voter) => {
    console.log("\n" + "=".repeat(80));
    console.log("🗳️  VOTE CAST");
    console.log("=".repeat(80));
    console.log(`👤 Voter:        ${voter}`);
    console.log(`🎯 Candidate ID: ${contestantId.toString()}`);
    console.log(`📊 Poll ID:      ${pollId.toString()}`);
    console.log("=".repeat(80) + "\n");
  });

  // Keep the script running
  console.log("⏳ Listener is active. Press Ctrl+C to stop.\n");
  
  // Prevent the script from exiting
  await new Promise(() => {});
}

main()
  .then(() => {})
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
