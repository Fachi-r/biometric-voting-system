import { useState, useEffect } from 'react';
import { contractService, Poll, Contestant } from '@/services/contractService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Users, Crown, Eye, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PollAnalyticsProps {
  poll: Poll;
}

interface VoterAnalytics {
  address: string;
  candidateVoted: string;
  timestamp: number;
}

const PollAnalytics = ({ poll }: PollAnalyticsProps) => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showVoterDetails, setShowVoterDetails] = useState(false);

  useEffect(() => {
    loadContestants();
  }, [poll.id]);

  const loadContestants = async () => {
    setLoading(true);
    try {
      const data = await contractService.getContestants(poll.id);
      setContestants(data);
    } catch (error: any) {
      toast({
        title: "Error Loading Analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLeadingCandidate = () => {
    if (contestants.length === 0) return null;
    return contestants.reduce((leader, candidate) => 
      candidate.votes > leader.votes ? candidate : leader
    );
  };

  const getTotalVotes = () => {
    return contestants.reduce((total, candidate) => total + candidate.votes, 0);
  };

  const getVotePercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const leadingCandidate = getLeadingCandidate();
  const totalVotes = getTotalVotes();

  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Poll Analytics - {poll.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Leading Candidate */}
        {leadingCandidate && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">Leading Candidate</h4>
                <p className="text-sm text-muted-foreground">{leadingCandidate.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{leadingCandidate.votes}</div>
              <div className="text-sm text-muted-foreground">
                {getVotePercentage(leadingCandidate.votes)}% of votes
              </div>
            </div>
          </div>
        )}

        {/* Vote Distribution */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Vote Distribution</h4>
            <Badge variant="outline">{totalVotes} total votes</Badge>
          </div>
          
          <div className="space-y-3">
            {contestants
              .sort((a, b) => b.votes - a.votes)
              .map((candidate, index) => (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{candidate.name}</span>
                      {index === 0 && totalVotes > 0 && (
                        <Crown className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {candidate.votes} votes
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getVotePercentage(candidate.votes)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={getVotePercentage(candidate.votes)} 
                    className="h-2"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Poll Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <div className="text-xl font-bold text-secondary">{poll.contestantCount}</div>
            <div className="text-xs text-muted-foreground">Candidates</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <div className="text-xl font-bold text-success">{totalVotes}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
        </div>

        {/* Voter Details Modal */}
        <Dialog open={showVoterDetails} onOpenChange={setShowVoterDetails}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-lg">
            <DialogHeader>
              <DialogTitle>Detailed Analytics</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Candidate Performance</h4>
                {contestants
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{candidate.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {candidate.account.slice(0, 6)}...{candidate.account.slice(-4)}
                        </span>
                        <Badge variant="outline">{candidate.votes}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground">
                  Individual voter addresses are private for security reasons.
                  Only aggregated voting data is displayed.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PollAnalytics;