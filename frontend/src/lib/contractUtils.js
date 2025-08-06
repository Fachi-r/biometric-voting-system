// src/lib/contractsUtil.js

import { ethers } from 'ethers';
import DappVotesABI from "blockchain/artifacts/contracts/DappVotes.sol/DappVotes.json";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0x1d3565abf6848fdfa99104b4a1324f97190ecf7a6eda6d76e7e89a277b74f8fe';

// Get the Ethereum provider and signer
export async function getProviderAndSigner() {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install it.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();

  return { provider, signer };
}

// Initialize and return contract instance
export async function getContract() {
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, DappVotesABI.abi, signer);
}

// Connect wallet and get address
export async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
}

// Get all elections (assumes public getter in contract)
export async function fetchElections() {
  try {
    const contract = await getContract();
    const elections = await contract.getElections();
    return elections;
  } catch (err) {
    console.error('Failed to fetch elections:', err);
    return [];
  }
}

// Get candidates for a given election
export async function fetchCandidates(electionId) {
  try {
    const contract = await getContract();
    const candidates = await contract.getCandidates(electionId);
    return candidates;
  } catch (err) {
    console.error(`Failed to fetch candidates for election ${electionId}:`, err);
    return [];
  }
}

// Cast a vote
export async function castVote(candidateId) {
  try {
    const contract = await getContract();
    const tx = await contract.vote(candidateId);
    await tx.wait(); // Wait for transaction to be mined
    return tx.hash;
  } catch (err) {
    console.error('Voting failed:', err);
    throw err;
  }
}

// Admin: create a new election
export async function createElection(title, description) {
  try {
    const contract = await getContract();
    const tx = await contract.createElection(title, description);
    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error('Creating election failed:', err);
    throw err;
  }
}

// Admin: add candidate to an election
export async function addCandidate(electionId, name, party, imageUrl) {
  try {
    const contract = await getContract();
    const tx = await contract.addCandidate(electionId, name, party, imageUrl);
    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error('Adding candidate failed:', err);
    throw err;
  }
}

// Admin: fetch vote count
export async function fetchResults(electionId) {
  try {
    const contract = await getContract();
    const results = await contract.getResults(electionId);
    return results;
  } catch (err) {
    console.error('Fetching results failed:', err);
    return [];
  }
}

// Check if connected wallet is admin (if contract supports it)
export async function isAdmin(address) {
  try {
    const contract = await getContract();
    const isAdmin = await contract.isAdmin(address);
    return isAdmin;
  } catch (err) {
    console.warn('isAdmin check failed:', err);
    return false;
  }
}

