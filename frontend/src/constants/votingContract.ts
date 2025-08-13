export const TARGET_CHAIN_ID = 31337;

export const VOTING_CONTRACT_ADDRESS = import.meta.env
  .VITE_VOTING_CONTRACT_ADDRESS as `0x${string}`;

// Hardcoded ABI (stable)
export const VOTING_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'contestantId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'contestant', type: 'address' }
    ],
    name: 'Contested',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' }
    ],
    name: 'PollCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'pollId', type: 'uint256' }
    ],
    name: 'PollDeleted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'pollId', type: 'uint256' }
    ],
    name: 'PollUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'contestantId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'voter', type: 'address' }
    ],
    name: 'Voted',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'image', type: 'string' }
    ],
    name: 'contest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'image', type: 'string' },
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'startsAt', type: 'uint256' },
      { internalType: 'uint256', name: 'endsAt', type: 'uint256' }
    ],
    name: 'createPoll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' }
    ],
    name: 'deletePoll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { internalType: 'uint256', name: 'contestantId', type: 'uint256' }
    ],
    name: 'getContestant',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'image', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'address', name: 'account', type: 'address' },
          { internalType: 'uint256', name: 'votes', type: 'uint256' }
        ],
        internalType: 'struct DappVotes.Contestant',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' }
    ],
    name: 'getContestants',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'image', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'address', name: 'account', type: 'address' },
          { internalType: 'uint256', name: 'votes', type: 'uint256' }
        ],
        internalType: 'struct DappVotes.Contestant[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' }
    ],
    name: 'getPoll',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'image', type: 'string' },
          { internalType: 'string', name: 'title', type: 'string' },
          { internalType: 'string', name: 'description', type: 'string' },
          { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
          { internalType: 'uint256', name: 'contestantCount', type: 'uint256' },
          { internalType: 'bool', name: 'deleted', type: 'bool' },
          { internalType: 'address', name: 'director', type: 'address' },
          { internalType: 'uint256', name: 'startsAt', type: 'uint256' },
          { internalType: 'uint256', name: 'endsAt', type: 'uint256' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' }
        ],
        internalType: 'struct DappVotes.Poll',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getPollCount',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getPolls',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'image', type: 'string' },
          { internalType: 'string', name: 'title', type: 'string' },
          { internalType: 'string', name: 'description', type: 'string' },
          { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
          { internalType: 'uint256', name: 'contestantCount', type: 'uint256' },
          { internalType: 'bool', name: 'deleted', type: 'bool' },
          { internalType: 'address', name: 'director', type: 'address' },
          { internalType: 'uint256', name: 'startsAt', type: 'uint256' },
          { internalType: 'uint256', name: 'endsAt', type: 'uint256' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' }
        ],
        internalType: 'struct DappVotes.Poll[]',
        name: 'activePolls',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' }
    ],
    name: 'hasUserContested',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' }
    ],
    name: 'hasUserVoted',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { internalType: 'string', name: 'image', type: 'string' },
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'startsAt', type: 'uint256' },
      { internalType: 'uint256', name: 'endsAt', type: 'uint256' }
    ],
    name: 'updatePoll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pollId', type: 'uint256' },
      { internalType: 'uint256', name: 'contestantId', type: 'uint256' }
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;
