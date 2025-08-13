
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, UserPlus, Users, CheckCircle, XCircle } from 'lucide-react';

interface Voter {
  id: string;
  name: string;
  email: string;
  status: 'registered' | 'voted' | 'inactive';
  registrationDate: string;
  lastActivity: string;
}

const AdminVoters: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock voter data
  const [voters] = useState<Voter[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@institution.edu',
      status: 'voted',
      registrationDate: '2024-12-01',
      lastActivity: '2024-12-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@institution.edu',
      status: 'registered',
      registrationDate: '2024-12-02',
      lastActivity: '2024-12-14'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@institution.edu',
      status: 'registered',
      registrationDate: '2024-12-03',
      lastActivity: '2024-12-13'
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice.brown@institution.edu',
      status: 'inactive',
      registrationDate: '2024-11-15',
      lastActivity: '2024-11-20'
    },
    {
      id: '5',
      name: 'Charlie Davis',
      email: 'charlie.davis@institution.edu',
      status: 'voted',
      registrationDate: '2024-12-01',
      lastActivity: '2024-12-16'
    }
  ]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const filteredVoters = voters.filter(voter =>
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'voted': return 'bg-green-100 text-green-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'voted': return <CheckCircle className="h-4 w-4" />;
      case 'registered': return <Users className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const voterStats = {
    total: voters.length,
    voted: voters.filter(v => v.status === 'voted').length,
    registered: voters.filter(v => v.status === 'registered').length,
    inactive: voters.filter(v => v.status === 'inactive').length
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
                  Voter Management
                </h1>
                <p className="text-lg text-slate-600">
                  Manage voter registration and status
                </p>
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => alert('Add voter functionality would be implemented here')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Voter
            </Button>
          </div>

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
                    Total Voters
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{voterStats.total}</div>
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
                    Voted
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{voterStats.voted}</div>
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
                    Registered
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{voterStats.registered}</div>
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
                    Inactive
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{voterStats.inactive}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search voters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Voters List */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle>Registered Voters</CardTitle>
              <CardDescription>
                Manage voter registration and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVoters.map((voter, index) => (
                  <motion.div
                    key={voter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="font-medium text-slate-600">
                          {voter.name.split(' ').map(n => n.charAt(0)).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{voter.name}</h3>
                        <p className="text-sm text-slate-600">{voter.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          Registered: {new Date(voter.registrationDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          Last activity: {new Date(voter.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(voter.status)} border-0 flex items-center gap-1`}>
                        {getStatusIcon(voter.status)}
                        {voter.status.charAt(0).toUpperCase() + voter.status.slice(1)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredVoters.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No voters found
                  </h3>
                  <p className="text-slate-600">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No voters have been registered yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminVoters;
