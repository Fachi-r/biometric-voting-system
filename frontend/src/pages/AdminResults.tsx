
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Trophy, Users, TrendingUp } from 'lucide-react';

const AdminResults: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { elections } = useVoting();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedElectionId, setSelectedElectionId] = useState<string>(
    searchParams.get('election') || elections[0]?.id || ''
  );

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const selectedElection = elections.find(e => e.id === selectedElectionId);

  // Mock vote data - in a real app, this would come from blockchain/database
  const generateMockResults = (election: any) => {
    const totalVotes = Math.floor(Math.random() * 1000) + 500;
    const results = election.candidates.map((candidate: any, index: number) => {
      // Generate realistic vote distributions
      const baseVotes = Math.floor(Math.random() * 300) + 50;
      const variation = index === 0 ? 1.2 : index === 1 ? 1.0 : 0.8; // Give first candidate slight advantage
      const votes = Math.floor(baseVotes * variation);
      
      return {
        ...candidate,
        votes,
        percentage: 0 // Will be calculated below
      };
    });

    // Calculate actual total and percentages
    const actualTotal = results.reduce((sum, r) => sum + r.votes, 0);
    results.forEach(result => {
      result.percentage = (result.votes / actualTotal) * 100;
    });

    // Sort by votes (descending)
    results.sort((a, b) => b.votes - a.votes);

    return {
      totalVotes: actualTotal,
      results,
      turnout: Math.floor(Math.random() * 30) + 60 // 60-90% turnout
    };
  };

  const mockData = selectedElection ? generateMockResults(selectedElection) : null;

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                onClick={() => navigate('/admin')}
                variant="ghost"
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Election Results
                </h1>
                <p className="text-lg text-slate-600">
                  Monitor voting results and statistics
                </p>
              </div>
            </div>
          </div>

          {/* Election Selector */}
          <div className="mb-8">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Select Election
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedElectionId} onValueChange={setSelectedElectionId}>
                  <SelectTrigger className="w-full md:w-96">
                    <SelectValue placeholder="Choose an election" />
                  </SelectTrigger>
                  <SelectContent>
                    {elections.map((election) => (
                      <SelectItem key={election.id} value={election.id}>
                        {election.title} ({election.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {selectedElection && mockData && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        Total Votes
                      </CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">
                        {mockData.totalVotes.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        Voter Turnout
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">
                        {mockData.turnout}%
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        Leading Candidate
                      </CardTitle>
                      <Trophy className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-slate-900">
                        {mockData.results[0]?.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {mockData.results[0]?.percentage.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        Candidates
                      </CardTitle>
                      <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">
                        {selectedElection.candidates.length}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Results */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Results for {selectedElection.title}</span>
                    <Badge className={`${
                      selectedElection.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedElection.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    } border-0`}>
                      {selectedElection.status.charAt(0).toUpperCase() + selectedElection.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Live voting results updated in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockData.results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {index === 0 && (
                              <Trophy className="h-5 w-5 text-amber-500" />
                            )}
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                              <span className="font-bold text-slate-600">
                                {result.name.split(' ').map(n => n.charAt(0)).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{result.name}</h3>
                              <p className="text-sm text-slate-600">{result.party}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-slate-900">
                              {result.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-slate-600">
                              {result.votes.toLocaleString()} votes
                            </div>
                          </div>
                        </div>
                        <Progress value={result.percentage} className="h-3" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!selectedElection && (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">
                  No Election Selected
                </h3>
                <p className="text-slate-600">
                  Please select an election to view its results.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminResults;
