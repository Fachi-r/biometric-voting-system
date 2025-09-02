import { ethers } from 'ethers';

// Contract data will be loaded dynamically after deployment
let contractData: { address: string; abi: any[] } | null = null;

// Load contract data
const loadContractData = async () => {
  if (!contractData) {
    try {
      const response = await fetch('/src/contracts/DappVotes.json');
      contractData = await response.json();
    } catch (error) {
      throw new Error('Contract not deployed. Please deploy the contract first.');
    }
  }
  return contractData;
};

export interface Poll {
  id: number;
  image: string;
  title: string;
  description: string;
  voteCount: number;
  contestantCount: number;
  deleted: boolean;
  director: string;
  startsAt: number;
  endsAt: number;
  createdAt: number;
}

export interface Contestant {
  id: number;
  image: string;
  name: string;
  account: string;
  votes: number;
}

export interface CreatePollData {
  image: string;
  title: string;
  description: string;
  startsAt: number;
  endsAt: number;
}

export interface ContestData {
  name: string;
  image: string;
}

class ContractService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  // Initialize the contract with a signer
  async initialize(signer: ethers.JsonRpcSigner): Promise<void> {
    this.signer = signer;
    const contract = await loadContractData();
    this.contract = new ethers.Contract(
      contract.address,
      contract.abi,
      signer
    );
  }

  // Check if contract is initialized
  private ensureInitialized(): void {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized. Please connect your wallet first.');
    }
  }

  // Get all polls
  async getPolls(): Promise<Poll[]> {
    this.ensureInitialized();
    try {
      const polls = await this.contract!.getPolls();
      return polls.map((poll: any) => ({
        id: Number(poll.id),
        image: poll.image,
        title: poll.title,
        description: poll.description,
        voteCount: Number(poll.voteCount),
        contestantCount: Number(poll.contestantCount),
        deleted: poll.deleted,
        director: poll.director,
        startsAt: Number(poll.startsAt),
        endsAt: Number(poll.endsAt),
        createdAt: Number(poll.createdAt),
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch polls: ${error.message}`);
    }
  }

  // Get a specific poll
  async getPoll(pollId: number): Promise<Poll> {
    this.ensureInitialized();
    try {
      const poll = await this.contract!.getPoll(pollId);
      return {
        id: Number(poll.id),
        image: poll.image,
        title: poll.title,
        description: poll.description,
        voteCount: Number(poll.voteCount),
        contestantCount: Number(poll.contestantCount),
        deleted: poll.deleted,
        director: poll.director,
        startsAt: Number(poll.startsAt),
        endsAt: Number(poll.endsAt),
        createdAt: Number(poll.createdAt),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch poll: ${error.message}`);
    }
  }

  // Get contestants for a poll
  async getContestants(pollId: number): Promise<Contestant[]> {
    this.ensureInitialized();
    try {
      const contestants = await this.contract!.getContestants(pollId);
      return contestants.map((contestant: any) => ({
        id: Number(contestant.id),
        image: contestant.image,
        name: contestant.name,
        account: contestant.account,
        votes: Number(contestant.votes),
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch contestants: ${error.message}`);
    }
  }

  // Create a new poll
  async createPoll(pollData: CreatePollData): Promise<string> {
    this.ensureInitialized();
    try {
      const tx = await this.contract!.createPoll(
        pollData.image,
        pollData.title,
        pollData.description,
        pollData.startsAt,
        pollData.endsAt
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to create poll: ${error.message}`);
    }
  }

  // Update a poll
  async updatePoll(pollId: number, pollData: CreatePollData): Promise<string> {
    this.ensureInitialized();
    try {
      const tx = await this.contract!.updatePoll(
        pollId,
        pollData.image,
        pollData.title,
        pollData.description,
        pollData.startsAt,
        pollData.endsAt
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to update poll: ${error.message}`);
    }
  }

  // Delete a poll
  async deletePoll(pollId: number): Promise<string> {
    this.ensureInitialized();
    try {
      const tx = await this.contract!.deletePoll(pollId);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to delete poll: ${error.message}`);
    }
  }

  // Join a contest
  async joinContest(pollId: number, contestData: ContestData): Promise<string> {
    this.ensureInitialized();
    try {
      const tx = await this.contract!.contest(
        pollId,
        contestData.name,
        contestData.image
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to join contest: ${error.message}`);
    }
  }

  // Vote for a contestant
  async vote(pollId: number, contestantId: number): Promise<string> {
    this.ensureInitialized();
    try {
      const tx = await this.contract!.vote(pollId, contestantId);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to cast vote: ${error.message}`);
    }
  }

  // Check if user has voted
  async hasUserVoted(pollId: number, userAddress: string): Promise<boolean> {
    this.ensureInitialized();
    try {
      return await this.contract!.hasAddressVoted(pollId, userAddress);
    } catch (error: any) {
      throw new Error(`Failed to check vote status: ${error.message}`);
    }
  }

  // Get poll status
  async getPollStatus(pollId: number): Promise<string> {
    this.ensureInitialized();
    try {
      return await this.contract!.getPollStatus(pollId);
    } catch (error: any) {
      throw new Error(`Failed to get poll status: ${error.message}`);
    }
  }

  // Check if poll is active
  async isPollActive(pollId: number): Promise<boolean> {
    this.ensureInitialized();
    try {
      return await this.contract!.isPollActive(pollId);
    } catch (error: any) {
      throw new Error(`Failed to check if poll is active: ${error.message}`);
    }
  }

  // Get user's polls (polls created by user)
  async getUserPolls(userAddress: string): Promise<number[]> {
    this.ensureInitialized();
    try {
      const pollIds = await this.contract!.getUserPolls(userAddress);
      return pollIds.map((id: any) => Number(id));
    } catch (error: any) {
      throw new Error(`Failed to fetch user polls: ${error.message}`);
    }
  }
}

export const contractService = new ContractService();