import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { disconnectWallet } from '@/store/slices/walletSlice';
import { contractService, Poll } from '@/services/contractService';
import { walletService } from '@/services/walletService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PollCard from '@/components/PollCard';
import Navbar from '@/components/Navbar';
import { Vote, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VoterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const wallet = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    if (wallet.isConnected) {
      loadPolls();
    }
  }, [wallet.isConnected]);

  const loadPolls = async () => {
    if (!wallet.isConnected) return;
    
    setLoading(true);
    try {
      const fetchedPolls = await contractService.getPolls();
      setPolls(fetchedPolls);
    } catch (error: any) {
      toast({
        title: "Error Loading Polls",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoteComplete = async () => {
    loadPolls(); // Reload polls to update vote counts
    
    // Disconnect wallet and redirect to home after successful vote
    setTimeout(async () => {
      try {
        await walletService.disconnectWallet();
        dispatch(disconnectWallet());
        
        toast({
          title: "Vote Recorded Successfully",
          description: "You have been redirected to the home page.",
        });
        
        navigate('/');
        window.location.reload();
      } catch (error) {
        console.error('Error disconnecting after vote:', error);
        navigate('/');
        window.location.reload();
      }
    }, 2000); // Give user time to see the success message
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />

      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {!wallet.isConnected ? (
          <div className="text-center py-16">
            <Card className="glass-card border-border/50 max-w-md mx-auto">
              <CardContent className="p-8">
                <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  Please connect your wallet to access the voting platform.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        Welcome back, {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}!
                      </h2>
                      <p className="text-muted-foreground">Your participation helps shape our community's future.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold gradient-text">{polls.length}</div>
                      <div className="text-sm text-muted-foreground">Available Polls</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Polls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="glass-card border-border/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : polls.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Polls Available</h3>
                  <p className="text-muted-foreground">
                    There are no polls to display at the moment.
                  </p>
                </div>
              ) : (
                polls.map((poll) => (
                  <PollCard 
                    key={poll.id} 
                    poll={poll} 
                    onVoteComplete={handleVoteComplete}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VoterDashboard;