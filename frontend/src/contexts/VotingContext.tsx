
import React, { createContext, useContext, useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  photo: string;
  description: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  candidates: Candidate[];
}

interface Vote {
  electionId: string;
  candidateId: string;
  transactionHash?: string;
  timestamp: string;
}

interface VotingContextType {
  elections: Election[];
  selectedElection: Election | null;
  selectedCandidate: Candidate | null;
  userVotes: Vote[];
  selectElection: (election: Election) => void;
  selectCandidate: (candidate: Candidate) => void;
  submitVote: () => Promise<string>;
  createElection: (election: Omit<Election, 'id'>) => void;
  addCandidate: (electionId: string, candidate: Omit<Candidate, 'id'>) => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

// Mock data for demonstration
const mockElections: Election[] = [
  {
    id: '1',
    title: 'Presidential Election 2025',
    description: 'National Presidential Election',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: 'active',
    candidates: [
      {
        id: '1',
        name: 'Alice Johnson',
        party: 'Democratic Party',
        photo: '/placeholder.svg',
        description: 'Experienced leader with focus on education and healthcare'
      },
      {
        id: '2',
        name: 'Bob Smith',
        party: 'Republican Party',
        photo: '/placeholder.svg',
        description: 'Business executive with strong economic policies'
      },
      {
        id: '3',
        name: 'Carol Davis',
        party: 'Independent',
        photo: '/placeholder.svg',
        description: 'Environmental advocate and community organizer'
      }
    ]
  },
  {
    id: '2',
    title: 'District By-Election',
    description: 'Local District Representative Election',
    startDate: '2025-02-01',
    endDate: '2025-02-15',
    status: 'upcoming',
    candidates: [
      {
        id: '4',
        name: 'David Wilson',
        party: 'Liberal Party',
        photo: '/placeholder.svg',
        description: 'Local advocate for infrastructure development'
      },
      {
        id: '5',
        name: 'Emma Brown',
        party: 'Conservative Party',
        photo: '/placeholder.svg',
        description: 'Former city council member with fiscal responsibility focus'
      }
    ]
  }
];

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>(mockElections);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);

  const selectElection = (election: Election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
  };

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  // Simulate blockchain vote submission
  const submitVote = async (): Promise<string> => {
    if (!selectedElection || !selectedCandidate) {
      throw new Error('No election or candidate selected');
    }

    try {
      // Simulate blockchain transaction
      console.log('Submitting vote to blockchain...');
      
      // In a real app, this would interact with smart contract
      // const contract = new ethers.Contract(contractAddress, abi, signer);
      // const tx = await contract.vote(electionId, candidateId);
      // await tx.wait();
      
      // Simulate transaction processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const vote: Vote = {
        electionId: selectedElection.id,
        candidateId: selectedCandidate.id,
        transactionHash: mockTxHash,
        timestamp: new Date().toISOString(),
      };

      setUserVotes(prev => [...prev, vote]);
      return mockTxHash;
    } catch (error) {
      console.error('Vote submission failed:', error);
      throw error;
    }
  };

  const createElection = (electionData: Omit<Election, 'id'>) => {
    const newElection: Election = {
      ...electionData,
      id: Date.now().toString(),
    };
    setElections(prev => [...prev, newElection]);
  };

  const addCandidate = (electionId: string, candidateData: Omit<Candidate, 'id'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
    };

    setElections(prev => prev.map(election => 
      election.id === electionId 
        ? { ...election, candidates: [...election.candidates, newCandidate] }
        : election
    ));
  };

  const value: VotingContextType = {
    elections,
    selectedElection,
    selectedCandidate,
    userVotes,
    selectElection,
    selectCandidate,
    submitVote,
    createElection,
    addCandidate,
  };

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
