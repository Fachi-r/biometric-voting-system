const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main () {
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

  // Only export when user asks for it
  const shouldExport =
    process.argv.includes("--export-accounts") ||
    process.env.EXPORT_ACCOUNTS === "1" ||
    process.env.EXPORT_ACCOUNTS === "true";

  if (shouldExport) {
    const networkConfig = hre.network.config || {};
    const outPath = path.join(contractsDir, "accounts.json");
    let exported = [];

    if (Array.isArray(networkConfig.accounts) && networkConfig.accounts.length > 0) {
      // accounts is an array of private keys
      exported = networkConfig.accounts.map((pk) => {
        const w = new hre.ethers.Wallet(pk);
        return { address: w.address, privateKey: pk };
      });

    } else {
      // use mnemonic path (either provided in config or fallback to Hardhat's default)
      const fallbackMnemonic = "test test test test test test test test test test test junk";
      const mnemonic = (networkConfig.accounts && networkConfig.accounts.mnemonic) || fallbackMnemonic;

      // We'll derive the first 20 addresses (same scheme Hardhat uses)
      const count = 20;
      for (let i = 0; i < count; i++) {
        // ethers v6: HDNodeWallet.fromPhrase(phrase, password?, path?)
        // Derivation path: m/44'/60'/0'/0/i
        const path = `m/44'/60'/0'/0/${i}`;
        const wallet = hre.ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);
        exported.push({
          address: wallet.address,
          privateKey: wallet.privateKey
        });
      }
    }

    fs.writeFileSync(outPath, JSON.stringify(exported, null, 2));
    console.log(`Accounts exported to ${outPath}`);
    console.log("⚠️  Do NOT commit this file to git. Add src/contracts/accounts.json to .gitignore.");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Start the frontend: npm run dev");
  console.log("2. Connect MetaMask to Hardhat network");
  console.log("3. Import a test account from Hardhat node (or use src/contracts/accounts.json)");
  console.log("4. Start creating polls and voting!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
