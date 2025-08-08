import { ethers } from "ethers";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Admin signer (must set ADMIN_PRIVATE_KEY in your environment variables)
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// Directory to store voter JSON files
const votersDir = path.join(process.cwd(), "voters");

// Hash the fingerprint using SHA-256
function hashFingerprint(fingerprint) {
  return "0x" + crypto.createHash("sha256").update(fingerprint).digest("hex");
}

// Ensure the voters directory exists, create if missing
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Read JSON file safely
async function readJson(filePath) {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

// Write JSON file safely
async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { fingerprint } = req.body;
  if (!fingerprint) {
    return res.status(400).json({ error: "Missing fingerprint" });
  }

  const fingerprintHash = hashFingerprint(fingerprint);

  try {
    // Ensure voters directory exists
    await ensureDir(votersDir);

    // Read all voter files to check for duplicate fingerprint
    const files = await fs.readdir(votersDir);
    for (const file of files) {
      const filePath = path.join(votersDir, file);
      const data = await readJson(filePath);
      if (data.fingerprintHash === fingerprintHash) {
        return res.status(409).json({ error: "Fingerprint already registered" });
      }
    }

    // Create a new Ethereum wallet for the voter
    const wallet = ethers.Wallet.createRandom();

    // Fund the new wallet with 5 ETH from the admin signer
    const tx = await signer.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther("5"),
    });
    await tx.wait();

    // Prepare voter record
    const record = {
      fingerprintHash,
      walletAddress: wallet.address,
      privateKey: wallet.privateKey, // sensitive info: handle carefully on frontend
      createdAt: new Date().toISOString(),
      used: false,
    };

    // Save voter record to a JSON file
    const fileName = `voter_${wallet.address}.json`;
    await writeJson(path.join(votersDir, fileName), record);

    // Respond with wallet info
    return res.status(200).json({
      walletAddress: wallet.address,
      privateKey: wallet.privateKey,
    });
  } catch (err) {
    console.error("Error in registration:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
