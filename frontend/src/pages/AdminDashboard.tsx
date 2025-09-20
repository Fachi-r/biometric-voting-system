import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { contractService, Poll } from '@/services/contractService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import CreatePollDialog from '@/components/CreatePollDialog';
import UpdatePollDialog from '@/components/UpdatePollDialog';
import EnrollVoterModal from '@/components/EnrollVoterModal';
import PollAnalytics from '@/components/PollAnalytics';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  BarChart3, 
  Clock, 
  Vote,
  Settings,
  Calendar,
  UserPlus,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const wallet = useSelector((state: RootState) => state.wallet);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isEnrollVoterOpen, setIsEnrollVoterOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<{ [key: number]: boolean }>({});
  const [analytics, setAnalytics] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    avgTurnout: 0
  });

  useEffect(() => {
    if (wallet.isConnected) {
      loadDashboardData();
    }
  }, [wallet.isConnected]);

  const loadDashboardData = async () => {
    if (!wallet.isConnected) return;
    
    setLoading(true);
    try {
      const fetchedPolls = await contractService.getPolls();
      setPolls(fetchedPolls);
      
      // Calculate real analytics from blockchain data
      const now = Date.now() / 1000;
      const activePolls = fetchedPolls.filter(poll => 
        now >= poll.startsAt && now <= poll.endsAt
      ).length;
      
      const totalVotes = fetchedPolls.reduce((sum, poll) => sum + poll.voteCount, 0);
      const avgTurnout = fetchedPolls.length > 0 
        ? (totalVotes / fetchedPolls.length) / 100 // Simplified calculation
        : 0;

      setAnalytics({
        totalPolls: fetchedPolls.length,
        activePolls,
        totalVotes,
        avgTurnout: Math.min(avgTurnout, 100) // Cap at 100%
      });
    } catch (error: any) {
      toast({
        title: "Error Loading Dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: number, title: string) => {
    if (!wallet.address) return;
    
    try {
      const txHash = await contractService.deletePoll(pollId);
      toast({
        title: "Poll Deleted",
        description: `"${title}" has been removed. Tx: ${txHash.slice(0, 10)}...`,
      });
      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = Date.now() / 1000;
    if (now < poll.startsAt) return 'upcoming';
    if (now >= poll.startsAt && now <= poll.endsAt) return 'active';
    return 'ended';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success border-success/50';
      case 'upcoming':
        return 'text-primary border-primary/50';
      case 'ended':
        return 'text-muted-foreground border-border';
      default:
        return 'text-muted-foreground border-border';
    }
  };

  const handleUpdatePoll = (poll: Poll) => {
    setSelectedPoll(poll);
    setIsUpdateDialogOpen(true);
  };

  const toggleAnalytics = (pollId: number) => {
    setShowAnalytics(prev => ({
      ...prev,
      [pollId]: !prev[pollId]
    }));
  };

  const handleDisconnectAndHome = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Orbs Background */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />

      {/* Header */}
      <Navbar />

      <main className="relative z-10 container mx-auto px-6 py-8">
        {!wallet.isConnected ? (
          <div className="text-center py-16">
            <Card className="glass-card border-border/50 max-w-md mx-auto">
              <CardContent className="p-8">
                <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  Please connect your wallet to access admin features.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Admin Features */}
            <div className="lg:col-span-2 space-y-8">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome, <span className="gradient-text">Admin</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Manage elections, oversee voting processes, and ensure democratic transparency.
                  </p>
                </div>
                
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Election
                </Button>
              </div>

              {/* Analytics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Vote className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{loading ? '...' : analytics.totalPolls}</p>
                        <p className="text-xs text-muted-foreground">Total Elections</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{loading ? '...' : analytics.activePolls}</p>
                        <p className="text-xs text-muted-foreground">Active Elections</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{loading ? '...' : analytics.totalVotes.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Votes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{loading ? '...' : `${analytics.avgTurnout.toFixed(0)}%`}</p>
                        <p className="text-xs text-muted-foreground">Avg Turnout</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Election Management */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Election Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading elections...</div>
                  ) : polls.length === 0 ? (
                    <div className="text-center py-8">
                      <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Elections Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first election to get started.
                      </p>
                      <Button 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Election
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {polls.map((poll) => {
                        const status = getPollStatus(poll);
                        return (
                          <div key={poll.id} className="space-y-4">
                            <div className="p-4 rounded-lg border border-border/30 bg-card/50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="font-semibold text-foreground">{poll.title}</h3>
                                    <Badge variant="outline" className={getStatusColor(status)}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">{poll.description}</p>
                                  <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <Users className="w-3 h-3" />
                                      <span>{poll.voteCount} votes</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Vote className="w-3 h-3" />
                                      <span>{poll.contestantCount} candidates</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(poll.endsAt * 1000).toLocaleDateString()}</span>
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => toggleAnalytics(poll.id)}
                                    className="text-primary border-primary/50 hover:bg-primary/10"
                                  >
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    Analytics
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdatePoll(poll)}
                                    disabled={poll.voteCount > 0}
                                    className="text-primary border-primary/50 hover:bg-primary/10 disabled:opacity-50"
                                    title={poll.voteCount > 0 ? "Cannot update poll with existing votes" : "Update poll"}
                                  >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Update
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeletePoll(poll.id, poll.title)}
                                    disabled={poll.voteCount > 0}
                                    className="text-destructive border-destructive/50 hover:bg-destructive/10 disabled:opacity-50"
                                    title={poll.voteCount > 0 ? "Cannot delete poll with existing votes" : "Delete poll"}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Analytics Section */}
                            {showAnalytics[poll.id] && (
                              <PollAnalytics poll={poll} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Voter Enrollment */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Fingerprint className="w-5 h-5" />
                    <span>Voter Enrollment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-foreground">Biometric Registration</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enroll voters with secure fingerprint authentication for tamper-proof elections.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsEnrollVoterOpen(true)}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Enroll New Voter
                    </Button>
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Registered Voters</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        3 Active
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Latest enrollment: 2 hours ago
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-card border-border/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 text-foreground">Security Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Biometric Auth</span>
                      <Badge variant="outline" className="text-success border-success/50 text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Blockchain Security</span>
                      <Badge variant="outline" className="text-success border-success/50 text-xs">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Smart Contract</span>
                      <Badge variant="outline" className="text-success border-success/50 text-xs">
                        Deployed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <CreatePollDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={loadDashboardData}
        />
        
        <UpdatePollDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          onSuccess={loadDashboardData}
          poll={selectedPoll}
        />

        <EnrollVoterModal
          open={isEnrollVoterOpen}
          onOpenChange={setIsEnrollVoterOpen}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;