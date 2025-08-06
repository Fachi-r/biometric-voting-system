
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Vote, BarChart3, Plus, Settings, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Admin: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { elections } = useVoting();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const activeElections = elections.filter(e => e.status === 'active').length;
  const upcomingElections = elections.filter(e => e.status === 'upcoming').length;
  const completedElections = elections.filter(e => e.status === 'completed').length;
  const totalCandidates = elections.reduce((sum, e) => sum + e.candidates.length, 0);

  const quickActions = [
    {
      title: 'Create Election',
      description: 'Set up a new election',
      icon: Plus,
      action: () => navigate('/admin/create'),
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Elections',
      description: 'View and edit existing elections',
      icon: Settings,
      action: () => navigate('/admin/elections'),
      color: 'bg-green-500'
    },
    {
      title: 'View Results',
      description: 'Monitor election results',
      icon: BarChart3,
      action: () => navigate('/admin/results'),
      color: 'bg-purple-500'
    },
    {
      title: 'Manage Voters',
      description: 'Handle voter registration',
      icon: Users,
      action: () => navigate('/admin/voters'),
      color: 'bg-amber-500'
    }
  ];

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Manage elections, candidates, and monitor voting activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Elections
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{activeElections}</div>
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
                    Upcoming Elections
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{upcomingElections}</div>
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
                    Total Candidates
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{totalCandidates}</div>
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
                    Completed Elections
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{completedElections}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={action.action}
                >
                  <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="text-center pb-2">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-slate-600">
                        {action.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Elections */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Elections</h2>
            <div className="grid gap-4">
              {elections.slice(0, 3).map((election, index) => (
                <motion.div
                  key={election.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {election.title}
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                          {election.candidates.length} candidates • {new Date(election.startDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${
                          election.status === 'active' ? 'bg-green-100 text-green-800' :
                          election.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        } border-0`}
                      >
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </Badge>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
