import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { contractService, Poll, Contestant } from '@/services/contractService';
import { Vote, Users, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PollCardProps {
  poll: Poll;
  onVoteComplete?: () => void;
}

const PollCard = ({ poll, onVoteComplete }: PollCardProps) => {
  const navigate = useNavigate();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const wallet = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    if (wallet.address) {
      loadPollData();
    }
  }, [poll.id, wallet.address]);

  const loadPollData = async () => {
    if (!wallet.address) return;
    
    try {
      setLoading(true);
      const [contestantData, votedStatus] = await Promise.all([
        contractService.getContestants(poll.id),
        contractService.hasUserVoted(poll.id, wallet.address)
      ]);
      
      setContestants(contestantData);
      setHasVoted(votedStatus);
    } catch (error: any) {
      toast({
        title: "Error Loading Poll Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (contestantId: number) => {
    if (!wallet.address) return;
    
    setVoting(true);
    try {
      const txHash = await contractService.vote(poll.id, contestantId);
      
      toast({
        title: "Vote Submitted Successfully!",
        description: `Your vote has been recorded on the blockchain. Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      await loadPollData();
      onVoteComplete?.();
      
      // Redirect to home dashboard after successful vote
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Voting Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const getPollStatus = () => {
    const now = Date.now() / 1000;
    if (now < poll.startsAt) return 'upcoming';
    if (now >= poll.startsAt && now <= poll.endsAt) return 'active';
    return 'ended';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success border-success/50';
      case 'upcoming': return 'bg-primary/20 text-primary border-primary/50';
      case 'ended': return 'bg-muted text-muted-foreground border-muted-foreground/50';
      default: return 'bg-muted text-muted-foreground border-muted-foreground/50';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = () => {
    const now = Date.now() / 1000;
    const target = now < poll.startsAt ? poll.startsAt : poll.endsAt;
    const remaining = (target - now) * 1000;
    
    if (remaining <= 0) return null;
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const status = getPollStatus();
  const timeRemaining = getTimeRemaining();
  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

  return (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{poll.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {poll.description}
            </p>
          </div>
          <Badge variant="outline" className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Poll Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Vote className="w-4 h-4 text-primary" />
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-secondary" />
            <span>{contestants.length} candidates</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{timeRemaining || 'Ended'}</span>
          </div>
        </div>

        {/* Poll Timeline */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Starts: {formatDate(poll.startsAt)}</span>
            <span>Ends: {formatDate(poll.endsAt)}</span>
          </div>
        </div>

        {/* Contestants */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading candidates...</div>
        ) : contestants.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No candidates yet</div>
        ) : (
          <div className="space-y-3">
            {contestants.map((contestant) => {
              const votePercentage = totalVotes > 0 ? (contestant.votes / totalVotes) * 100 : 0;
              
              return (
                  <div key={contestant.id} className="p-3 rounded-lg border border-border/30 bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          // Try to load from localStorage first
                          const storedImage = localStorage.getItem(`candidate_${poll.id}_${contestant.name}`);
                          const imageToShow = storedImage || contestant.image;
                          
                          return imageToShow ? (
                            <img 
                              src={imageToShow} 
                              alt={contestant.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                              <span className="text-2xl font-bold text-primary">
                                {contestant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          );
                        })()}
                        <span className="font-medium text-base">{contestant.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contestant.votes} votes
                      </div>
                    </div>
                  
                  <div className="space-y-2">
                    <Progress value={votePercentage} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {votePercentage.toFixed(1)}%
                      </span>
                      
                      {status === 'active' && !hasVoted && (
                        <Button
                          size="sm"
                          onClick={() => handleVote(contestant.id)}
                          disabled={voting}
                          className="h-7 px-3 text-xs"
                        >
                          {voting ? 'Voting...' : 'Vote'}
                        </Button>
                      )}
                      
                      {hasVoted && (
                        <Badge variant="outline" className="border-success/50 text-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Voted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Status Messages */}
        {status === 'upcoming' && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Voting starts {formatDate(poll.startsAt)}
          </div>
        )}
        
        {status === 'ended' && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Voting ended {formatDate(poll.endsAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollCard;