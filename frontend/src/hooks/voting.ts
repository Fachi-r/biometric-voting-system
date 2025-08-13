import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS, TARGET_CHAIN_ID } from '@/constants/votingContract';
import { hardhat } from 'wagmi/chains';
export type Poll = {
  id: bigint;
  image: string;
  title: string;
  description: string;
  voteCount: bigint;
  contestantCount: bigint;
  deleted: boolean;
  director: `0x${string}`;
  startsAt: bigint;
  endsAt: bigint;
  createdAt: bigint;
};

export type Contestant = {
  id: bigint;
  image: string;
  name: string;
  account: `0x${string}`;
  votes: bigint;
};

// Reads
export function usePolls() {
  const res = useReadContract({
    abi: VOTING_CONTRACT_ABI,
    address: VOTING_CONTRACT_ADDRESS,
    functionName: 'getPolls',
    chainId: TARGET_CHAIN_ID,
  });
  return res as typeof res & { data: Poll[] | undefined };
}

export function usePoll(pollId?: bigint) {
  const res = useReadContract({
    abi: VOTING_CONTRACT_ABI,
    address: VOTING_CONTRACT_ADDRESS,
    functionName: 'getPoll',
    args: pollId !== undefined ? [pollId] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: pollId !== undefined },
  });
  return res as typeof res & { data: Poll | undefined };
}

export function useContestants(pollId?: bigint) {
  const res = useReadContract({
    abi: VOTING_CONTRACT_ABI,
    address: VOTING_CONTRACT_ADDRESS,
    functionName: 'getContestants',
    args: pollId !== undefined ? [pollId] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: pollId !== undefined },
  });
  return res as typeof res & { data: Contestant[] | undefined };
}

export function useHasVoted(pollId?: bigint, user?: `0x${string}`) {
  const res = useReadContract({
    abi: VOTING_CONTRACT_ABI,
    address: VOTING_CONTRACT_ADDRESS,
    functionName: 'hasUserVoted',
    args: pollId !== undefined && user ? [pollId, user] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: pollId !== undefined && !!user },
  });
  return res as typeof res & { data: boolean | undefined };
}

export function useHasContested(pollId?: bigint, user?: `0x${string}`) {
  const res = useReadContract({
    abi: VOTING_CONTRACT_ABI,
    address: VOTING_CONTRACT_ADDRESS,
    functionName: 'hasUserContested',
    args: pollId !== undefined && user ? [pollId, user] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: pollId !== undefined && !!user },
  });
  return res as typeof res & { data: boolean | undefined };
}

// Writes
function useWriteHelper() {
  const { address } = useAccount();
  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: write.data, chainId: TARGET_CHAIN_ID });
  return { write, wait, address };
}

export function useCreatePoll() {
  const { write, wait, address } = useWriteHelper();
  const createPoll = async (image: string, title: string, description: string, startsAt: bigint, endsAt: bigint) => {
    const hash = await write.writeContractAsync({
      abi: VOTING_CONTRACT_ABI,
      address: VOTING_CONTRACT_ADDRESS,
      account: address as `0x${string}`,
      chain: hardhat,
      functionName: 'createPoll',
      args: [image, title, description, startsAt, endsAt],
    });
    return hash;
  };
  return { createPoll, hash: write.data, isPending: write.isPending, ...wait };
}

export function useContest() {
  const { write, wait, address } = useWriteHelper();
  const contest = async (pollId: bigint, name: string, image: string) => {
    const hash = await write.writeContractAsync({
      abi: VOTING_CONTRACT_ABI,
      address: VOTING_CONTRACT_ADDRESS,
      account: address as `0x${string}`,
      chain: hardhat,
      functionName: 'contest',
      args: [pollId, name, image],
    });
    return hash;
  };
  return { contest, hash: write.data, isPending: write.isPending, ...wait };
}

export function useVote() {
  const { write, wait, address } = useWriteHelper();
  const vote = async (pollId: bigint, contestantId: bigint) => {
    const hash = await write.writeContractAsync({
      abi: VOTING_CONTRACT_ABI,
      address: VOTING_CONTRACT_ADDRESS,
      account: address as `0x${string}`,
      chain: hardhat,
      functionName: 'vote',
      args: [pollId, contestantId],
    });
    return hash;
  };
  return { vote, hash: write.data, isPending: write.isPending, ...wait };
}

export function useUpdatePoll() {
  const { write, wait, address } = useWriteHelper();
  const updatePoll = async (
    pollId: bigint,
    image: string,
    title: string,
    description: string,
    startsAt: bigint,
    endsAt: bigint,
  ) => {
    const hash = await write.writeContractAsync({
      abi: VOTING_CONTRACT_ABI,
      address: VOTING_CONTRACT_ADDRESS,
      account: address as `0x${string}`,
      chain: hardhat,
      functionName: 'updatePoll',
      args: [pollId, image, title, description, startsAt, endsAt],
    });
    return hash;
  };
  return { updatePoll, hash: write.data, isPending: write.isPending, ...wait };
}

export function useDeletePoll() {
  const { write, wait, address } = useWriteHelper();
  const deletePoll = async (pollId: bigint) => {
    const hash = await write.writeContractAsync({
      abi: VOTING_CONTRACT_ABI,
      address: VOTING_CONTRACT_ADDRESS,
      account: address as `0x${string}`,
      chain: hardhat,
      functionName: 'deletePoll',
      args: [pollId],
    });
    return hash;
  };
  return { deletePoll, hash: write.data, isPending: write.isPending, ...wait };
}
