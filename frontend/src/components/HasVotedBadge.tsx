import { Badge } from '@/components/ui/badge'
import { CheckCircle, X } from 'lucide-react'
import { useHasVoted } from '@/hooks/voting'

interface HasVotedBadgeProps {
  pollId: number
  address: string
}

export function HasVotedBadge({ pollId, address }: HasVotedBadgeProps) {
  const { data: hasVoted, isLoading } = useHasVoted(pollId, address)

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Checking...
      </Badge>
    )
  }

  return (
    <Badge
      variant={hasVoted ? "default" : "outline"}
      className={hasVoted ? "bg-success text-success-foreground" : ""}
    >
      {hasVoted ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Already Voted
        </>
      ) : (
        <>
          <X className="w-3 h-3 mr-1" />
          Not Voted
        </>
      )}
    </Badge>
  )
}