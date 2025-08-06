
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, Users, Settings, Eye } from 'lucide-react';

const AdminElections: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { elections } = useVoting();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                  Manage Elections
                </h1>
                <p className="text-lg text-slate-600">
                  View and manage all elections
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Election
            </Button>
          </div>

          {/* Elections Grid */}
          <div className="grid gap-6">
            {elections.map((election, index) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {election.title}
                        </CardTitle>
                        <CardDescription className="text-slate-600 mt-1">
                          {election.description}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(election.status)} border-0`}>
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{election.candidates.length} candidates</span>
                      </div>
                    </div>

                    {/* Candidates List */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-slate-900 mb-2">Candidates:</h4>
                      <div className="flex flex-wrap gap-2">
                        {election.candidates.map((candidate) => (
                          <Badge
                            key={candidate.id}
                            variant="outline"
                            className="bg-slate-50"
                          >
                            {candidate.name} ({candidate.party})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                        onClick={() => navigate(`/admin/results?election=${election.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Results</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                        disabled={election.status === 'completed'}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {elections.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                No Elections Found
              </h3>
              <p className="text-slate-600 mb-4">
                Get started by creating your first election.
              </p>
              <Button
                onClick={() => navigate('/admin/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Election
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminElections;
