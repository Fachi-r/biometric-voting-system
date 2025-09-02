# VoteForge - Secure Blockchain Voting Platform

VoteForge is a modern, decentralized voting application built on blockchain technology, featuring role-based access, biometric authentication simulation, and comprehensive poll management.

## 🏗️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components + Custom gradient design system  
- **Blockchain**: Hardhat local network + Ethers.js 6.x + MetaMask integration
- **State Management**: Redux Toolkit with slices for wallet, polls, modals, and transactions
- **Routing**: React Router DOM with role-based routes
- **Forms**: React Hook Form + Zod validation

## 🎨 Design System & Branding

### VoteForge Brand Identity
- **Primary**: Electric blockchain blue (hsl(234 89% 74%))
- **Secondary**: Deep purple (hsl(262 83% 58%)) 
- **Success**: Crypto green (hsl(160 84% 39%))
- **Background**: Dark navy (hsl(225 15% 9%)) with gradient overlays
- **Cards**: Glass-morphism effect with subtle borders and backdrop blur

### Visual Effects
- Floating orb animations with blur effects
- Gradient buttons with hover lift animations
- Blockchain pulse animation for fingerprint icons
- Staggered reveal animations for content sections
- Custom CSS gradients and smooth transitions

## 🛣️ Application Routes

- `/` — Landing page with role selection and biometric auth
- `/voter-dashboard` — Voter portal for casting votes 
- `/admin-dashboard` — Admin portal for poll management
- `*` — 404 Not Found page

## 🔐 Smart Contract Features

### DappVotes Contract Structures

```solidity
struct Poll {
    uint id;
    string image;
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
    string image;
    string name;
    address account;
    uint votes;
}
```

### Core Functions

- `createPoll()` — Create new voting polls with time constraints
- `updatePoll()` — Edit polls (only by director, before votes cast)
- `deletePoll()` — Soft delete polls (only if no votes)
- `contest()` — Register as contestant in a poll
- `vote()` — Cast vote for contestant (with validation)
- View functions: `getPolls()`, `getContestants()`, `hasUserVoted()`

### Security Features

- Role-based access (only poll director can modify)
- Vote validation (one vote per address per poll)  
- Time constraints (polls only active within start/end times)
- Contestant validation (minimum 2 contestants required)
- Immutable voting records on blockchain

## 🗳️ Voter Dashboard Features

- **Wallet Connection**: MetaMask integration with network validation
- **Welcome Message**: Personalized greeting with wallet address
- **Voting Stats**: Real-time poll counts and participation data
- **Polls Grid**: Responsive layout showing available polls
- **Real-time Status**: Active/Upcoming/Ended poll indicators
- **Vote Confirmation**: MetaMask transaction signing for votes
- **Vote History**: Track voting participation per poll

## ⚙️ Admin Dashboard Features  

- **Analytics Overview**: Real blockchain data (no fake metrics)
  - Total Elections count
  - Active Elections count  
  - Total Votes cast
  - Average voter turnout
- **Poll Management**: Create, delete polls with MetaMask confirmation
- **Candidate Management**: Add minimum 2 candidates during poll creation
- **Real-time Status**: Live poll status updates from blockchain
- **Transaction Tracking**: Hash tracking for all admin actions

## 🔗 Blockchain Integration

### MetaMask Features
- Detect MetaMask installation
- Connect/disconnect wallet functionality
- Enforce Hardhat network (31337)
- Account and network change listeners

### Transaction Handling
- Loading states during blockchain interactions
- Transaction hash tracking and display
- Error handling with user-friendly messages
- Success notifications with transaction details

### State Synchronization  
- Redux updates after blockchain actions
- Real-time polling data refresh
- Wallet state persistence
- Event listeners for wallet/network changes

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MetaMask browser extension

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd voteforge
npm install
```

### 2. Install Blockchain Dependencies

```bash
cd blockchain
npm install
```

### 3. Start Hardhat Network

```bash
cd blockchain
npx hardhat node
```

This will start a local blockchain network at `http://127.0.0.1:8545` with 20 test accounts pre-loaded with 10,000 ETH each.

### 4. Deploy Smart Contract

In a new terminal:
```bash
cd blockchain  
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy the DappVotes contract to the local network
- Generate contract ABI and address in `src/contracts/DappVotes.json`
- Display the contract address and deployment transaction

### 5. Start Frontend Application

In a new terminal:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 MetaMask Configuration

### Add Hardhat Network to MetaMask

1. Open MetaMask and click "Add Network"
2. Configure with these settings:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

### Import Test Account

1. Copy a private key from the Hardhat node terminal output
2. In MetaMask: Account menu → Import Account → Enter private key
3. The account will have 10,000 ETH for testing

## 📖 Usage Guide

### Creating a Poll (Admin)

1. Navigate to Admin Dashboard via landing page
2. Complete biometric authentication (2s simulation)
3. Connect MetaMask wallet
4. Click "Create Election" 
5. Fill out poll details:
   - Title and description
   - Start and end dates (future times required)
   - Poll image URL (optional)
   - Add minimum 2 candidates with names and avatar URLs
6. Submit and confirm transaction in MetaMask
7. Wait for blockchain confirmation

### Voting (Voter)

1. Navigate to Voter Dashboard via landing page  
2. Complete biometric authentication
3. Connect MetaMask wallet
4. Browse available active polls
5. Click "Vote" on desired candidate
6. Confirm transaction in MetaMask
7. Receive confirmation with transaction hash

### Poll Management (Admin)

- **View Analytics**: Real-time blockchain data display
- **Delete Polls**: Only possible if no votes have been cast
- **Monitor Status**: See active, upcoming, and ended polls
- **Track Participation**: View vote counts and candidate standings

## 🧪 Testing

### Run Smart Contract Tests

```bash
cd blockchain
npx hardhat test
```

Tests cover:
- Poll lifecycle (create, update, delete)
- Contestant registration
- Voting mechanics and restrictions  
- Time window enforcement
- Permission validation
- Edge cases and error handling

### Test Coverage

- Poll creation with various parameters
- Contestant management
- Vote validation and restrictions
- Time constraint enforcement  
- Director permission controls
- Error scenarios and edge cases

## 🔍 Troubleshooting

### Common Issues

1. **MetaMask not connecting**
   - Ensure Hardhat node is running
   - Check network configuration (Chain ID: 31337)
   - Refresh browser and try reconnecting

2. **Transaction failures**
   - Verify sufficient ETH balance
   - Check if poll is within active time window
   - Ensure not voting twice in same poll
   - Confirm wallet is connected to Hardhat network

3. **Contract not found error**  
   - Redeploy contract: `npx hardhat run scripts/deploy.js --network localhost`
   - Refresh frontend application
   - Check that `src/contracts/DappVotes.json` exists

4. **Time-related errors**
   - Ensure start time is in the future
   - Verify end time is after start time
   - Check system clock synchronization

### Reset Development Environment

If you encounter persistent issues:

```bash
# Terminal 1: Restart Hardhat node
cd blockchain
npx hardhat node

# Terminal 2: Redeploy contract  
cd blockchain
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Restart frontend
npm run dev
```

## 🛡️ Security Features

### On-Chain Security
- Immutable vote records
- Time-gated poll access
- Single vote per address enforcement
- Director-only poll management
- Contestant validation requirements

### Frontend Security  
- MetaMask transaction signing
- Network validation (Hardhat only)
- Input validation and sanitization
- Error boundary implementation
- Secure state management

## 🔧 Development Commands

### Blockchain Development
```bash
cd blockchain

# Start local network
npx hardhat node

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Clean artifacts
npx hardhat clean
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📁 Project Structure

```
voteforge/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn/ui components
│   │   ├── BiometricAuth.tsx
│   │   ├── WalletConnection.tsx
│   │   ├── PollCard.tsx
│   │   └── CreatePollDialog.tsx
│   ├── pages/               # Route components
│   │   ├── Index.tsx
│   │   ├── VoterDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── NotFound.tsx
│   ├── services/            # Business logic
│   │   ├── contractService.ts
│   │   └── walletService.ts
│   ├── store/               # Redux state management
│   │   ├── index.ts
│   │   └── slices/
│   ├── contracts/           # Generated contract artifacts
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities
├── blockchain/              # Hardhat blockchain setup
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Contract tests
│   └── hardhat.config.js    # Hardhat configuration
├── public/                  # Static assets
└── package.json
```

## 📄 License

MIT License - see LICENSE file for details.

---

**VoteForge**: Securing democracy through blockchain technology. 🗳️⛓️