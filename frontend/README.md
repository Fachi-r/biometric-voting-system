# 🗳️ VoteForge: Secure Blockchain Voting Platform

**VoteForge** is a decentralized, blockchain-based voting platform that ensures transparency, security, and integrity in digital elections.
It features biometric authentication, voter registration, and on-chain poll management, empowering both administrators and voters through trustless, verifiable processes.

---

## 🧩 Technical Stack

### **Frontend**

* **Framework:** React 18 + TypeScript + Vite
* **UI & Styling:** Tailwind CSS + Radix UI + custom gradient system
* **State Management:** Redux Toolkit (slices for wallet, polls, modals, voters, and transactions)
* **Routing:** React Router DOM (role-based navigation)
* **Forms & Validation:** React Hook Form + Zod schema validation
* **Visualization:** Recharts for election analytics

### **Blockchain**

* **Smart Contracts:** Solidity (Hardhat local network)
* **Interaction:** Ethers.js v6.x
* **Wallet Integration:** MetaMask (for authentication and transactions)

---

## 🎨 Design System & Branding

| Element        | Description                           | Example            |
| -------------- | ------------------------------------- | ------------------ |
| **Primary**    | Electric Blockchain Blue              | `hsl(234 89% 74%)` |
| **Secondary**  | Deep Purple                           | `hsl(262 83% 58%)` |
| **Success**    | Crypto Green                          | `hsl(160 84% 39%)` |
| **Background** | Dark Navy + Gradient overlays         | `hsl(225 15% 9%)`  |
| **Cards**      | Glassmorphism — subtle borders + blur | —                  |

### **Visual Effects**

* Floating orb and blockchain pulse animations
* Gradient hover transitions on buttons
* Fingerprint scan animation for biometric verification
* Staggered content reveal animations

---

## 🛣️ Application Routes

| Route              | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `/`                | Landing page with role selection and biometric login     |
| `/voter-dashboard` | Voter interface to view polls and cast votes             |
| `/admin-dashboard` | Admin interface for poll and voter management            |
| `/register-voter`  | Admin-only route for registering voters with fingerprint |
| `*`                | 404 Page for undefined routes                            |

---

## 🔐 Smart Contract Overview

**Contract:** `DappVotes`

### **Structures**

```solidity
struct Poll {
    uint id;
    string title;
    string description;
    uint voteCount;
    uint contestantCount;
    bool deleted;
    address director;
    uint startsAt;
    uint endsAt;
    uint createdAt;
}

struct Contestant {
    uint id;
    string name;
    address account;
    uint votes;
}

struct Voter {
    address account;
    string fingerprintHash;
    bool registered;
    bool hasVoted;
}
```

### **Core Functions**

* `createPoll()` — Create new poll
* `updatePoll()` — Edit poll before voting begins
* `deletePoll()` — Soft-delete poll if no votes
* `contest()` — Register contestant
* `registerVoter()` — Add voter via fingerprint (admin only)
* `vote()` — Cast vote (only registered voters)

**View Functions:** `getPolls()`, `getContestants()`, `getVoters()`, `hasUserVoted()`

### **Security Features**

* One vote per registered fingerprint
* Voter whitelist (must be registered before voting)
* Role-based access: only admins register voters
* Time-window validation for polls
* Immutable on-chain data

---

## 🧑‍🗳️ Voter Dashboard Features

* Biometric authentication (simulated fingerprint scanner)
* MetaMask wallet connection and validation
* Personalized dashboard with address and fingerprint ID
* Poll list with real-time status: Active / Upcoming / Ended
* Transaction confirmation via MetaMask popup
* Live vote count updates and confirmation hash display

---

## 🧑‍💼 Admin Dashboard Features

### **Biometric Admin Login**

* Simulated fingerprint scan for secure access

### **Analytics Overview**

* Blockchain-sourced metrics

  * Total elections created
  * Active and upcoming polls
  * Total votes and voter turnout

### **Voter Management**

**Register New Voters:**

* Fingerprint scan simulation
* Unique fingerprint hash generation
* On-chain registration via `registerVoter()`
* MetaMask confirmation for each new voter

**View Registered Voters:**

* List of voter addresses and registration timestamps
* Search by fingerprint or wallet address

---

## 🗳️ Poll Management

* Create, update, and delete polls
* Add contestants (minimum 2 per poll)
* Track poll lifecycle: **Draft → Active → Ended**
* Real-time blockchain sync for poll data
* Transaction tracking with success/error notifications

---

## 🔗 Blockchain Integration

### **MetaMask Support**

* Auto-detect and prompt installation
* Wallet connect/disconnect UI
* Hardhat network enforcement (Chain ID: `31337`)
* Real-time wallet/account listener events

### **Transaction Management**

* Loading spinners for pending blockchain calls
* Transaction hash display and clickable verification link
* Error feedback for rejected or failed transactions
* Success toast messages on completion

### **State Synchronization**

* Redux updates on each blockchain event
* Live refresh for polls and voters
* Persistent wallet and voter state

---

## 📋 Prerequisites

* Node.js v16 or higher
* npm or yarn
* MetaMask browser extension

---

## 🛠️ Installation & Setup

```bash
# 1. Clone Repository
git clone <repository-url>
cd Biometric-Voting-System

# 2. Install Frontend Dependencies
cd frontend
npm install

# 3. Install Blockchain Dependencies
cd ../blockchain
npm install

# 4. Start Local Network
npx hardhat node

# 5. Deploy Smart Contract
npx hardhat run scripts/deploy.js --network localhost
```

**ABI and contract address** will be generated at:
`frontend/src/contracts/DappVotes.json`

```bash
# 6. Start Frontend
cd ../frontend
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173)

---

## 🧭 Usage Guide

### **Admin Workflow**

1. Log in via fingerprint simulation
2. Connect MetaMask wallet
3. Register new voters (biometric + wallet)
4. Create new polls and add contestants
5. Monitor poll progress and results

### **Voter Workflow**

1. Authenticate fingerprint
2. Connect wallet
3. View eligible polls
4. Cast vote once per poll
5. View transaction confirmation and live results

---

## 🧪 Testing

```bash
cd blockchain
npx hardhat test
```

**Tests include:**

* Voter registration and fingerprint validation
* Poll creation, update, deletion
* Vote casting and restrictions
* Role and time constraint enforcement

---

## 📁 Project Structure

```
Biometric-Voting-System/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── BiometricAuth.tsx
│   │   │   ├── RegisterVoterDialog.tsx
│   │   │   ├── WalletConnection.tsx
│   │   │   ├── PollCard.tsx
│   │   │   └── CreatePollDialog.tsx
│   │   ├── pages/
│   │   │   ├── Index.tsx
│   │   │   ├── VoterDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── RegisterVoterPage.tsx
│   │   │   └── NotFound.tsx
│   │   ├── services/
│   │   │   ├── contractService.ts
│   │   │   ├── walletService.ts
│   │   │   └── voterService.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   └── slices/
│   │   ├── contracts/
│   │   ├── hooks/
│   │   └── lib/
│   ├── public/
│   └── package.json
│
└── blockchain/
    ├── contracts/
    ├── scripts/
    ├── test/
    └── hardhat.config.js
```

---

## 🛡️ Security Highlights

* Fingerprint-based voter registration (simulated biometric hash)
* Immutable on-chain registry for voters and polls
* Role-based access control (admin vs voter)
* One vote per registered fingerprint
* Hardened input validation and safe transaction flow
* Restricted network (Hardhat or designated testnet only)

---

## 👨‍💻 Author

**Twange Chansa**, **Ziba Nyangulu**, **Farai Rubvuta**
Project: *Biometric Voting System (VoteForge)*

---

## 📜 License

Licensed under the **MIT License** — for educational and open development use.

---

**VoteForge** — Building trust in digital democracy through blockchain and biometrics. 🔗

---
