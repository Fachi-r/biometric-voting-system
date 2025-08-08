import { ethers } from "ethers";
import DappVotesABI from "@/abi/DappVotes.json"; // ✅ Use alias if you configured one

// --- Hardhat locblockchain/api/blockchain.jsal node
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// --- Admin private key from env
const ADMIN_PRIVATE_KEY = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;

// --- Global signer and contract
let signer = ADMIN_PRIVATE_KEY
  ? new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)
  : provider;

let contract;

/**
 * Initialize the DappVotes contract
 * @param {string} contractAddress - Deployed contract address
 * @param {ethers.Signer | ethers.Provider} [overrideSigner] - Optional signer override
 * @returns {ethers.Contract}
 */
export function initContract(contractAddress, overrideSigner = null) {
  const activeSigner = overrideSigner || signer;
  contract = new ethers.Contract(contractAddress, DappVotesABI.abi, activeSigner);
  return contract;
}

// === POLL MANAGEMENT ===

export async function createPoll(image, title, description, startsAt, endsAt) {
  const tx = await contract.createPoll(image, title, description, startsAt, endsAt);
  return await tx.wait();
}

export async function updatePoll(pollId, image, title, description, startsAt, endsAt) {
  const tx = await contract.updatePoll(pollId, image, title, description, startsAt, endsAt);
  return await tx.wait();
}

export async function deletePoll(pollId) {
  const tx = await contract.deletePoll(pollId);
  return await tx.wait();
}

export async function getPoll(pollId) {
  return await contract.getPoll(pollId);
}

export async function getPolls() {
  return await contract.getPolls();
}

export async function getPollCount() {
  return await contract.getPollCount();
}

// === CONTESTANT MANAGEMENT ===

export async function contest(pollId, name, image) {
  const tx = await contract.contest(pollId, name, image);
  return await tx.wait();
}

export async function getContestants(pollId) {
  return await contract.getContestants(pollId);
}

export async function getContestant(pollId, contestantId) {
  return await contract.getContestant(pollId, contestantId);
}

// === VOTING FUNCTIONS ===

export async function vote(pollId, contestantId) {
  const tx = await contract.vote(pollId, contestantId);
  return await tx.wait();
}

export async function hasUserVoted(pollId, userAddress) {
  return await contract.hasUserVoted(pollId, userAddress);
}

export async function hasUserContested(pollId, userAddress) {
  return await contract.hasUserContested(pollId, userAddress);
}
