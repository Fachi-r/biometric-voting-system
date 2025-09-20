# Complete Decentralized Voting DApp Design Prompt

## Project Overview
Create a full-stack decentralized voting application called "VoteForge" with blockchain integration, biometric authentication simulation, and role-based access control.

## Technology Stack Requirements

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui components
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast or similar

### Blockchain
- **Smart Contract**: Solidity ^0.8.20
- **Development Framework**: Hardhat
- **Blockchain Library**: Ethers.js v6
- **Network**: Hardhat local network (Chain ID: 31337)
- **Wallet Integration**: MetaMask

### Design System
- **Theme**: Dark theme with glassmorphism effects
- **Colors**: 
  - Primary: Blue gradient (hsl(234 89% 74%))
  - Secondary: Purple gradient (hsl(262 83% 58%))
  - Success: Green (hsl(160 84% 39%))
  - Warning: Yellow (hsl(45 93% 58%))
- **Typography**: Modern, clean fonts with proper hierarchy
- **Animations**: Smooth transitions, hover effects, micro-interactions

## Core Features & Functionality

### 1. Authentication System
- **Landing Page**: Role selection (Voter vs Admin)
- **Biometric Simulation**: Fingerprint scanner UI with loading states
- **Wallet Integration**: MetaMask connection with different behaviors:
  - **Admin**: Auto-connects to first Hardhat account
  - **Voter**: Shows account selection dialog

### 2. Smart Contract Architecture
```solidity
// Core contract structure
contract DappVotes {
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
    
    // Key functions to implement
    function createPoll(...) external;
    function updatePoll(...) external;
    function deletePoll(uint id) external;
    function contest(uint pollId, string name, string image) external;
    function vote(uint pollId, uint contestantId) external;
    function getPolls() external view returns (Poll[] memory);
    function getContestants(uint pollId) external view returns (Contestant[] memory);
    function hasUserVoted(uint pollId, address user) external view returns (bool);
}
```

### 3. Admin Dashboard Features
- **Auto-Connect**: Automatically connects to first Hardhat account
- **Poll Management**:
  - Create polls with image, title, description, start/end times
  - Update existing polls (only if no votes cast)
  - Delete polls (only if no votes cast)
  - View all polls with management actions
- **Contestant Management**:
  - Add multiple contestants to polls (more than 2)
  - Update contestant information
  - View contestant statistics
- **Analytics Dashboard**:
  - Real-time voting statistics
  - Platform metrics (active polls, total votes, etc.)
  - Visual charts and graphs
- **Access Control**: Only first Hardhat account can access admin functions

### 4. Voter Dashboard Features
- **Account Selection**: Manual wallet connection with MetaMask account chooser
- **Poll Browsing**:
  - View all active polls
  - Filter by status (active, upcoming, ended)
  - Search functionality
- **Voting System**:
  - One vote per address per poll
  - Real-time vote counting
  - Vote confirmation and blockchain transaction
- **Voting History**: Track user's voting participation
- **No Admin Access**: Voters cannot create, edit, or delete polls

### 5. Poll Detail Pages
- **Comprehensive Poll Info**: Title, description, timeline, creator
- **Contestant Display**: Cards with photos, names, vote counts
- **Real-time Results**: Live vote tallies and percentages
- **Progress Bars**: Visual representation of vote distribution
- **Status Indicators**: Active, upcoming, ended states
- **Responsive Design**: Works on all device sizes

## User Interface Requirements

### 1. Landing Page
- **Hero Section**: Gradient background with floating elements
- **Role Selection**: Two prominent cards (Voter/Admin)
- **Feature Highlights**: Security, transparency, blockchain benefits
- **Instructions**: Clear guidance for both user types

### 2. Biometric Authentication
- **Fingerprint Scanner**: Animated circular button
- **Loading States**: Pulse animations, progress indicators
- **Success/Error States**: Clear feedback
- **Realistic Timing**: 2-3 second scanning simulation

### 3. Dashboard Layouts
- **Admin Dashboard**:
  - Statistics cards at top
  - Poll management grid
  - Create poll button prominently placed
  - Account info display (no connect button)
- **Voter Dashboard**:
  - Connect wallet button
  - Personal voting stats
  - Available polls grid
  - Clean, focused interface

### 4. Modals & Forms
- **Create/Edit Poll**: Multi-step form with validation
- **Add Contestant**: Simple form with image preview
- **Delete Confirmation**: Warning dialogs with clear actions
- **Form Validation**: Real-time validation with error messages

## Technical Implementation Details

### 1. Wallet Management
```typescript
// Admin auto-connect
export const connectAdminWallet = async () => {
  // Auto-connect to first Hardhat account
  // No user interaction required
};

// Voter account selection
export const connectWallet = async () => {
  // Show MetaMask account selection
  // Allow user to choose account
};
```

### 2. State Management
- **Redux Store Structure**:
  - `wallet`: Connection state, account, chain ID
  - `polls`: Poll data, current poll, contestants
  - `modals`: Modal visibility states
  - `transactions`: Loading states, errors

### 3. Security Features
- **Input Validation**: Sanitize all user inputs
- **Access Control**: Role-based permissions
- **Transaction Security**: Proper error handling
- **Time Validation**: Ensure valid poll timeframes

### 4. Error Handling
- **Network Errors**: Clear messages for connection issues
- **Transaction Failures**: Detailed error explanations
- **Validation Errors**: Inline form feedback
- **Fallback States**: Graceful degradation

## Design Specifications

### 1. Color Palette
```css
:root {
  --primary: 234 89% 74%;
  --secondary: 262 83% 58%;
  --success: 160 84% 39%;
  --warning: 45 93% 58%;
  --background: 225 15% 9%;
  --foreground: 210 40% 98%;
  --card: 224 17% 11%;
  --border: 225 15% 20%;
}
```

### 2. Component Styling
- **Glass Cards**: Backdrop blur with subtle borders
- **Gradient Buttons**: Primary/secondary color gradients
- **Hover Effects**: Scale transforms, glow effects
- **Loading States**: Skeleton screens, pulse animations
- **Responsive Grid**: CSS Grid with proper breakpoints

### 3. Animation System
- **Page Transitions**: Smooth fade-in effects
- **Staggered Animations**: Sequential element reveals
- **Micro-interactions**: Button hovers, card lifts
- **Loading Indicators**: Spinners, progress bars

## Development Workflow

### 1. Project Structure
```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── modals/       # Modal components
│   ├── polls/        # Poll-related components
│   └── shared/       # Reusable components
├── pages/            # Route components
├── services/         # Blockchain integration
├── store/            # Redux store and slices
├── hooks/            # Custom React hooks
└── utils/            # Helper functions and types

blockchain/
├── contracts/        # Solidity contracts
├── scripts/          # Deployment scripts
├── test/             # Contract tests
└── hardhat.config.js
```

### 2. Development Commands
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production

# Blockchain
cd blockchain
npx hardhat node     # Start local blockchain
npx hardhat compile  # Compile contracts
npx hardhat test     # Run tests
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Testing Requirements
- **Smart Contract Tests**: Comprehensive Hardhat tests
- **Frontend Testing**: Component and integration tests
- **User Flow Testing**: End-to-end scenarios
- **Security Testing**: Access control validation

## Deployment & Configuration

### 1. MetaMask Setup
- **Network Configuration**:
  - Name: Hardhat Local
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency: ETH

### 2. Account Management
- **Admin Account**: First account from Hardhat node
- **Test Accounts**: Import additional accounts for testing
- **Balance**: Each account starts with 10,000 ETH

### 3. Contract Deployment
- **Automatic ABI Generation**: Copy ABI to frontend
- **Address Management**: Store contract address
- **Event Listening**: Real-time blockchain updates

## User Experience Flow

### 1. Admin Journey
1. Land on homepage → Select "Admin" role
2. Biometric authentication simulation
3. Auto-connect to first Hardhat account
4. View admin dashboard with statistics
5. Create new poll with multiple contestants
6. Manage existing polls (update/delete)
7. Monitor real-time voting results

### 2. Voter Journey
1. Land on homepage → Select "Voter" role
2. Biometric authentication simulation
3. Choose MetaMask account from selection
4. Browse available polls
5. View poll details and contestants
6. Cast vote (one per poll per address)
7. View voting confirmation and results

## Security & Best Practices

### 1. Smart Contract Security
- **Access Control**: Only poll directors can manage polls
- **Input Validation**: Sanitize all inputs
- **Time Constraints**: Enforce voting windows
- **Double-Vote Prevention**: Blockchain-level enforcement

### 2. Frontend Security
- **XSS Prevention**: Sanitize user inputs
- **CSRF Protection**: Proper form handling
- **Wallet Security**: Secure connection management
- **Error Handling**: No sensitive data exposure

### 3. User Privacy
- **Minimal Data Collection**: Only necessary information
- **Transparent Voting**: Public vote counts, private voter identity
- **Secure Storage**: No sensitive data in localStorage

This comprehensive prompt should provide another AI model with all the necessary details to recreate this decentralized voting DApp with the exact functionality, design, and technical requirements you've specified.