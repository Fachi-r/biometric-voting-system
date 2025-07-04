# Blockchain

This directory contains smart contracts and deployment scripts.

## Stack
- [Solidity](https://soliditylang.org) – Smart contract language
- [Hardhat](https://hardhat.org) – Ethereum development environment
- [pnpm](https://pnpm.io)

## Scripts
- `pnpm install` – Install dependencies
- `pnpm hardhat compile` – Compile contracts
- `pnpm hardhat test` – Run tests
- `pnpm hardhat run scripts/deploy.js --network <network>` – Deploy contracts

## Environment Variables
Configure `.env` as needed:

PRIVATE_KEY=your-wallet-private-key
RPC_URL=https://your-eth-node

## Notes
- Make sure you have enough test ETH for deployments.
