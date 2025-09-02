import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Clock, Edit, Trash2, Plus } from 'lucide-react'
import { usePolls } from '@/hooks/voting'
import { useState } from 'react'
import { PollDetail } from './PollDetail'
import { ContestantAdd } from './ContestantAdd'
import { PollUpdate } from './PollUpdate'
import { useDeletePoll } from '@/hooks/voting'

interface PollListProps {
  mode: 'voter' | 'admin'
}

export function PollList({ mode }: PollListProps) {
  const { data: polls, isLoading, error } = usePolls()
  const [selectedPollId, setSelectedPollId] = useState<number | null>(null)
  const [showAddContestant, setShowAddContestant] = useState<number | null>(null)
  const [showUpdatePoll, setShowUpdatePoll] = useState<number | null>(null)
  const { deletePoll, isLoading: isDeleting } = useDeletePoll()

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const isPollActive = (startsAt: bigint, endsAt: bigint) => {
    const now = Date.now() / 1000
    return Number(startsAt) <= now && Number(endsAt) >= now
  }

  const handleDeletePoll = async (pollId: number) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      await deletePoll(pollId)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 gradient-card border-border/50">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-muted rounded mb-2 w-full"></div>
              <div className="h-4 bg-muted rounded mb-4 w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 gradient-card border-border/50 text-center">
        <p className="text-destructive mb-4">Error loading polls</p>
        <p className="text-sm text-muted-foreground">
          Make sure your contract is deployed and the address is configured correctly.
        </p>
      </Card>
    )
  }

  if (!polls || polls.length === 0) {
    return (
      <Card className="p-8 gradient-card border-border/50 text-center">
        <div className="w-16 h-16 bg-muted/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Polls Available</h3>
        <p className="text-muted-foreground">
          {mode === 'admin' ? 'Create your first poll to get started' : 'Check back later for new polls'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-6">
        {polls.map((poll, index) => {
          const isActive = isPollActive(poll.startsAt, poll.endsAt)
          const isUpcoming = Number(poll.startsAt) > Date.now() / 1000
          const isEnded = Number(poll.endsAt) < Date.now() / 1000

          return (
            <motion.div
              key={poll.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 gradient-card border-border/50 hover-lift transition-smooth">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{poll.title}</h3>
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
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {poll.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(poll.startsAt)} - {formatDate(poll.endsAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{poll.votes.toString()} votes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{poll.contestants.toString()} candidates</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => setSelectedPollId(Number(poll.id))}
                      variant="outline"
                      className="hover-lift transition-smooth"
                    >
                      View Details
                    </Button>

                    {mode === 'admin' && (
                      <>
                        <Button
                          onClick={() => setShowAddContestant(Number(poll.id))}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Candidate
                        </Button>
                        
                        <Button
                          onClick={() => setShowUpdatePoll(Number(poll.id))}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDeletePoll(Number(poll.id))}
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Modals */}
      {selectedPollId && (
        <PollDetail
          pollId={selectedPollId}
          mode={mode}
          onClose={() => setSelectedPollId(null)}
        />
      )}

      {showAddContestant && (
        <ContestantAdd
          pollId={showAddContestant}
          onClose={() => setShowAddContestant(null)}
        />
      )}

      {showUpdatePoll && (
        <PollUpdate
          pollId={showUpdatePoll}
          onClose={() => setShowUpdatePoll(null)}
        />
      )}
    </>
  )
}