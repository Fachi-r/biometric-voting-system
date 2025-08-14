import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Vote as VoteIcon, CheckCircle, Loader2 } from 'lucide-react'
import { useVote } from '@/hooks/voting'
import { useState } from 'react'

interface VoteProps {
  pollId: number
  contestantId: number
  contestantName: string
}

export function Vote({ pollId, contestantId, contestantName }: VoteProps) {
  const { vote, isLoading, isSuccess, txHash } = useVote()
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = async () => {
    if (window.confirm(`Are you sure you want to vote for ${contestantName}?`)) {
      await vote(pollId, contestantId)
      setHasVoted(true)
    }
  }

  if (isSuccess || hasVoted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 text-success"
      >
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Vote Cast!</span>
      </motion.div>
    )
  }

  return (
    <Button
      onClick={handleVote}
      disabled={isLoading}
      className="gradient-primary hover-glow transition-smooth vote-success"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Voting...
        </>
      ) : (
        <>
          <VoteIcon className="w-4 h-4 mr-2" />
          Vote
        </>
      )}
    </Button>
  )
}