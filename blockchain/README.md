Here’s the text formatted properly in Markdown for documentation or a GitHub README:

---

# 🗳️ VoteForge Blockchain Module

**Biometric Voting System** — *Solidity · Hardhat · Ethers.js · Node.js*

---

## 🚀 Overview

The **VoteForge Blockchain Module** is the decentralized backend powering the Biometric Voting System.
It leverages **Solidity**, **Hardhat**, and **Ethers.js** to deploy, interact with, and test smart contracts that ensure secure, transparent, and tamper-proof elections on a local Ethereum blockchain.

This setup provides:

* A local **Hardhat** network for testing
* Automated contract deployment
* Real-time event monitoring for all voting-related activities — from voter registration to vote casting

---

## 🧠 Architecture

### **Core Components**

#### 📝 Smart Contract — `DappVotes.sol`

**Implements:**

##### **Voter Registration & Authentication**

* Links wallet addresses to biometric fingerprint IDs
* Prevents duplicate registrations
* Allows voter lookup by address or ID

##### **Poll Management**

* Create, update, and delete polls
* Track active/deleted status
* Retrieve all or individual poll details

##### **Candidate Management**

* Register candidates per poll with name, image, and wallet
* Prevent duplicates and ensure valid associations

##### **Voting System**

* One-vote-per-poll enforcement
* Immutable and anonymous vote recording
* Real-time tallying and event logging

---

### ⚙️ Hardhat Development Environment

* Local Ethereum blockchain simulation
* Contract compilation and deployment
* Automated testing and event monitoring

---

### 🪶 Event Listener — `listen.js`

* Monitors contract events in real-time
* Displays formatted logs for voter registration, poll creation, vote casting, etc.
* Aids in debugging and backend validation

---

## 🧰 Technology Stack

| Component     | Version | Purpose                  |
| ------------- | ------- | ------------------------ |
| **Solidity**  | ^0.8.27 | Smart contract language  |
| **Hardhat**   | 2.22.18 | Ethereum dev environment |
| **Ethers.js** | 6.15.0  | Blockchain interaction   |
| **Chai**      | —       | Testing assertions       |
| **Node.js**   | v16+    | Runtime environment      |

---

## 💻 Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
```

Make sure Hardhat is installed locally:

```bash
npm install --save-dev hardhat
```

---

### 2️⃣ Start Local Blockchain

Start a local Hardhat node with 20 pre-funded accounts:

```bash
npm run node
```

You’ll see test accounts and private keys printed in the terminal.

---

### 3️⃣ Export Test Accounts (Optional)

A script (`scripts/deploy.js`) connects to the node and exports all available test accounts to `accounts.json`.

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This generates an `accounts.json` file containing addresses and private keys — useful for MetaMask imports.

---

### 4️⃣ Deploy Contracts

Contracts are located in the `contracts/` directory.

To compile and deploy:

```bash
npm run deploy
```

This will:

* Compile `DappVotes.sol`
* Deploy it to `localhost:8545`
* Log the contract address and ABI
* Copy the ABI to `../src/contracts/DappVotes.json` for frontend use

---

### 5️⃣ Start Event Listener (Optional)

Monitor real-time blockchain events:

```bash
npm run listen
```

The listener displays all contract events (e.g., voter registration, poll creation, vote casting) with timestamps and color-coded output.

---

## 🧩 Useful Commands

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `npm run compile`      | Compiles smart contracts        |
| `npm run node`         | Starts local Hardhat blockchain |
| `npm run deploy`       | Deploys contracts to local node |
| `npm test`             | Runs all test scripts           |
| `npx hardhat accounts` | Lists available accounts        |

---

## 🧾 Project Structure

```
blockchain/
├── contracts/
│   └── DappVotes.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── DappVotes.test.js
├── artifacts/
├── cache/
├── listen.js
├── hardhat.config.js
├── package.json
├── accounts.json (generated)
└── README.md
```

---

## 🌐 Network Configuration

### **Hardhat Local Network**

```json
{
  "chainId": 31337,
  "url": "http://127.0.0.1:8545"
}
```

### **MetaMask Connection**

1. Open MetaMask → Add Network
2. Enter the following:

| Field               | Value                                          |
| ------------------- | ---------------------------------------------- |
| **Network Name**    | Hardhat Local                                  |
| **RPC URL**         | [http://127.0.0.1:8545](http://127.0.0.1:8545) |
| **Chain ID**        | 31337                                          |
| **Currency Symbol** | ETH                                            |

Import private keys from `accounts.json`.

---

## 🧪 Testing

Run the full test suite:

```bash
npm test
```

**Includes tests for:**

* Voter registration
* Poll creation, updates, and deletion
* Candidate addition
* Vote casting and validation
* Event emission
* Unauthorized access prevention

---

## 🛠️ Troubleshooting

| Problem                  | Solution                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| Contract fails to deploy | Ensure Hardhat node is running first                               |
| MetaMask wrong nonce     | Reset account (Settings → Advanced → Reset)                        |
| Events not appearing     | Restart `listen.js` and ensure contract address matches deployment |
| Accounts out of ETH      | Restart Hardhat node to reset balances                             |

---

## ⚙️ Development Workflow

```bash
# Terminal 1
npm run node   # or npx hardhat node

# Terminal 2
npm run deploy   # or npx hardhat run scripts/deploy.js --network localhost

# Terminal 3
npm run listen
```

---

## 🧩 Gas Optimization

| Operation      | Gas (approx.) |
| -------------- | ------------- |
| Register Voter | 150,000       |
| Create Poll    | 200,000       |
| Add Candidate  | 120,000       |
| Cast Vote      | 80,000        |

---

## 👨‍💻 Author

**Ziba Nyangulu**
**Project:** Biometric Voting System (*VoteForge Blockchain Backend*)
**Stack:** Solidity · Hardhat · Ethers.js · Node.js

---
