
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CandidateForm {
  name: string;
  party: string;
  description: string;
}

const CreateElection: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { createElection } = useVoting();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [candidates, setCandidates] = useState<CandidateForm[]>([
    { name: '', party: '', description: '' },
    { name: '', party: '', description: '' }
  ]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', party: '', description: '' }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, field: keyof CandidateForm, value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all election details.",
        variant: "destructive",
      });
      return;
    }

    const validCandidates = candidates.filter(c => c.name && c.party);
    if (validCandidates.length < 2) {
      toast({
        title: "Insufficient Candidates",
        description: "Please add at least 2 candidates with names and parties.",
        variant: "destructive",
      });
      return;
    }

    // Determine status based on dates
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
    if (now >= start && now <= end) {
      status = 'active';
    } else if (now > end) {
      status = 'completed';
    }

    const electionData = {
      title,
      description,
      startDate,
      endDate,
      status,
      candidates: validCandidates.map(c => ({
        ...c,
        photo: '/placeholder.svg',
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }))
    };

    createElection(electionData);
    
    toast({
      title: "Election Created",
      description: "The election has been successfully created.",
    });

    navigate('/admin/elections');
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center mb-8">
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
                Create New Election
              </h1>
              <p className="text-lg text-slate-600">
                Set up a new election with candidates
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Election Details */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Election Details</CardTitle>
                <CardDescription>
                  Basic information about the election
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Election Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Presidential Election 2025"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the election"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidates */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>
                    Add candidates for this election
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addCandidate}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border border-slate-200 rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-900">
                        Candidate {index + 1}
                      </h3>
                      {candidates.length > 2 && (
                        <Button
                          type="button"
                          onClick={() => removeCandidate(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`candidate-name-${index}`}>Name</Label>
                        <Input
                          id={`candidate-name-${index}`}
                          value={candidate.name}
                          onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                          placeholder="Candidate name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`candidate-party-${index}`}>Party</Label>
                        <Input
                          id={`candidate-party-${index}`}
                          value={candidate.party}
                          onChange={(e) => updateCandidate(index, 'party', e.target.value)}
                          placeholder="Political party"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`candidate-description-${index}`}>Description</Label>
                      <Textarea
                        id={`candidate-description-${index}`}
                        value={candidate.description}
                        onChange={(e) => updateCandidate(index, 'description', e.target.value)}
                        placeholder="Brief description of the candidate"
                        rows={2}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-8 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-5 w-5" />
                Create Election
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateElection;
