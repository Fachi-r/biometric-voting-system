import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS, TARGET_CHAIN_ID } from '@/constants/votingContract'
import { useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

// Read Hooks
export function usePolls() {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'getPolls',
    chainId: TARGET_CHAIN_ID,
  })
}

export function usePoll(pollId: number) {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'getPoll',
    args: [BigInt(pollId)],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: pollId > 0,
    },
  })
}

export function useContestants(pollId: number) {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'getContestants',
    args: [BigInt(pollId)],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: pollId > 0,
    },
  })
}

export function useHasVoted(pollId: number, address?: string) {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'hasUserVoted',
    args: [BigInt(pollId), address as `0x${string}`],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: pollId > 0 && !!address,
    },
  })
}

export function useHasContested(pollId: number, address?: string) {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'hasUserContested',
    args: [BigInt(pollId), address as `0x${string}`],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: pollId > 0 && !!address,
    },
  })
}

// Simplified write hooks
export function useCreatePoll() {
  const { writeContract, data: hash, error, isSuccess, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const createPoll = (image: string, title: string, description: string, startsAt: number, endsAt: number) => {
    (writeContract as any)({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: 'createPoll',
      args: [image, title, description, BigInt(startsAt), BigInt(endsAt)],
    })
  }

  return { createPoll, isLoading: isPending || isConfirming, isSuccess: isConfirmed, txHash: hash }
}

export function useContest() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const contest = (pollId: number, name: string, image: string) => {
    (writeContract as any)({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: 'contest',
      args: [BigInt(pollId), name, image],
    })
  }

  return { contest, isLoading: isPending || isConfirming, isSuccess, txHash: hash }
}

export function useVote() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const vote = (pollId: number, contestantId: number) => {
    (writeContract as any)({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: 'vote',
      args: [BigInt(pollId), BigInt(contestantId)],
    })
  }

  return { vote, isLoading: isPending || isConfirming, isSuccess, txHash: hash }
}

export function useUpdatePoll() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const updatePoll = (pollId: number, image: string, title: string, description: string, startsAt: number, endsAt: number) => {
    (writeContract as any)({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: 'updatePoll',
      args: [BigInt(pollId), image, title, description, BigInt(startsAt), BigInt(endsAt)],
    })
  }

  return { updatePoll, isLoading: isPending || isConfirming, isSuccess, txHash: hash }
}

export function useDeletePoll() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const deletePoll = (pollId: number) => {
    (writeContract as any)({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: 'deletePoll',
      args: [BigInt(pollId)],
    })
  }

  return { deletePoll, isLoading: isPending || isConfirming, isSuccess, txHash: hash }
}