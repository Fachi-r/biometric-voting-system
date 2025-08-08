🔗 Blockchain Module – Biometric Voting DApp
This directory contains the complete smart contract logic, testing, and deployment scripts for the Biometric Blockchain Voting System built with Hardhat and Solidity.

📁 Structure
bash
Copy
Edit
blockchain/
├── contracts/          # Smart contracts (e.g. DappVotes.sol)
├── scripts/            # Deployment scripts (e.g. deploy.js)
├── test/               # Automated tests using Hardhat + Chai
├── hardhat.config.js   # Hardhat configuration
├── package.json        # Dependencies and scripts
└── README.md           # here

📦 Prerequisites
Node.js v16+
Hardhat
MetaMask (for wallet interaction)
Ethers.js (ethers)
Optionally: pnpm, yarn, or npm for dependency management

⚙️ Install Dependencies
cd blockchain
pnpm install
# or
npm install
# or
yarn

🔨 Compile Smart Contracts
npx hardhat compile
🧪 Run Tests
bash
Copy
Edit
npx hardhat test
🧱 Start Local Hardhat Node
bash
Copy
Edit
npx hardhat node
🚀 Deploy Contract to Local Node
bash
Copy
Edit
npx hardhat run scripts/DappVotes.js --network localhost

## Environment Variables
Configure `.env` as needed:

PRIVATE_KEY=your-wallet-private-key
RPC_URL=https://your-eth-node

## Notes
- Make sure you have enough test ETH for deployments.
