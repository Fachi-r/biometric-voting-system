import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Users, Calendar, Clock, Vote, CheckCircle } from 'lucide-react'
import { usePoll, useContestants, useHasVoted } from '@/hooks/voting'
import { Vote as VoteComponent } from './Vote'
import { HasVotedBadge } from './HasVotedBadge'
import { useAccount } from 'wagmi'

interface PollDetailProps {
  pollId: number
  mode: 'voter' | 'admin'
  onClose: () => void
}

export function PollDetail({ pollId, mode, onClose }: PollDetailProps) {
  const { address } = useAccount()
  const { data: poll, isLoading: pollLoading } = usePoll(pollId)
  const { data: contestants, isLoading: contestantsLoading } = useContestants(pollId)
  const { data: hasVoted } = useHasVoted(pollId, address)

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  const isPollActive = (startsAt: bigint, endsAt: bigint) => {
    const now = Date.now() / 1000
    return Number(startsAt) <= now && Number(endsAt) >= now
  }

  const getTotalVotes = () => {
    if (!contestants) return 0
    return contestants.reduce((total, contestant) => total + Number(contestant.votes), 0)
  }

  const getVotePercentage = (votes: bigint) => {
    const total = getTotalVotes()
    if (total === 0) return 0
    return Math.round((Number(votes) / total) * 100)
  }

  if (pollLoading || contestantsLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto gradient-card border-border/50">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <Vote className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl">Loading poll details...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!poll) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md gradient-card border-border/50">
          <div className="p-8 text-center">
            <p className="text-destructive">Poll not found</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const isActive = isPollActive(poll.startsAt, poll.endsAt)
  const isUpcoming = Number(poll.startsAt) > Date.now() / 1000
  const isEnded = Number(poll.endsAt) < Date.now() / 1000

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{poll.title}</DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Poll Info */}
          <Card className="p-6 gradient-card border-border/50">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge
                variant={isActive ? "default" : isUpcoming ? "secondary" : "outline"}
                className={`
                  ${isActive ? "bg-success text-success-foreground" : ""}
                  ${isUpcoming ? "bg-warning text-warning-foreground" : ""}
                  ${isEnded ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isActive ? "Active" : isUpcoming ? "Upcoming" : "Ended"}
              </Badge>
              
              {mode === 'voter' && address && (
                <HasVotedBadge pollId={pollId} address={address} />
              )}
            </div>

            <p className="text-muted-foreground mb-4">{poll.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">Starts</p>
                  <p className="text-muted-foreground">{formatDate(poll.startsAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <div>
                  <p className="font-medium">Ends</p>
                  <p className="text-muted-foreground">{formatDate(poll.endsAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-success" />
                <div>
                  <p className="font-medium">Total Votes</p>
                  <p className="text-success font-bold">{getTotalVotes()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Candidates */}
          <div>
            <h3 className="text-xl font-bold mb-4">Candidates</h3>
            
            {!contestants || contestants.length === 0 ? (
              <Card className="p-8 gradient-card border-border/50 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No candidates added yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {contestants.map((contestant, index) => (
                    <motion.div
                      key={contestant.id.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="p-6 gradient-card border-border/50 hover-lift transition-smooth">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold">{contestant.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{contestant.votes.toString()} votes</span>
                                <span>{getVotePercentage(contestant.votes)}%</span>
                              </div>
                              
                              {/* Vote percentage bar */}
                              <div className="w-full bg-muted rounded-full h-2 mt-2">
                                <motion.div
                                  className="h-2 rounded-full gradient-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getVotePercentage(contestant.votes)}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                          </div>

                          {mode === 'voter' && isActive && address && !hasVoted && (
                            <VoteComponent
                              pollId={pollId}
                              contestantId={Number(contestant.id)}
                              contestantName={contestant.name}
                            />
                          )}

                          {hasVoted && (
                            <div className="flex items-center gap-2 text-success">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Voted</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}