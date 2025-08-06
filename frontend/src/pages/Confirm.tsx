
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Vote, Loader2, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Confirm: React.FC = () => {
  const { isAuthenticated, isWalletConnected } = useAuth();
  const { selectedElection, selectedCandidate, selectCandidate, submitVote } = useVoting();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [voteComplete, setVoteComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (!selectedElection) {
      navigate('/vote');
    }
  }, [isAuthenticated, selectedElection, navigate]);

  const handleCandidateSelect = (candidate: any) => {
    selectCandidate(candidate);
  };

  const handleVoteConfirm = () => {
    if (!selectedCandidate) {
      toast({
        title: "No candidate selected",
        description: "Please select a candidate before voting.",
        variant: "destructive",
      });
      return;
    }

    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit your vote.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleVoteSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      const txHash = await submitVote();
      setTransactionHash(txHash);
      setVoteComplete(true);
      
      toast({
        title: "Vote submitted successfully!",
        description: "Your vote has been recorded on the blockchain.",
      });
    } catch (error) {
      toast({
        title: "Vote submission failed",
        description: "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTransactionHash = () => {
    navigator.clipboard.writeText(transactionHash);
    toast({
      title: "Transaction hash copied",
      description: "The transaction hash has been copied to your clipboard.",
    });
  };

  if (!isAuthenticated || !selectedElection) {
    return null;
  }

  if (voteComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white shadow-xl border-0 text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Vote Submitted!
              </CardTitle>
              <CardDescription>
                Your vote has been successfully recorded on the blockchain
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Transaction Details</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Hash:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-slate-900">
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                    </span>
                    <Button
                      onClick={copyTransactionHash}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Blockchain Explorer
                </Button>
                
                <Button
                  onClick={() => navigate('/vote')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Return to Elections
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
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
          <div className="flex items-center mb-8">
            <Button
              onClick={() => navigate('/vote')}
              variant="ghost"
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Elections
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {selectedElection.title}
              </h1>
              <p className="text-lg text-slate-600">
                Select your candidate and cast your vote
              </p>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {selectedElection.candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => handleCandidateSelect(candidate)}
              >
                <Card className={`h-full bg-white shadow-lg border-2 hover:shadow-xl transition-all duration-300 ${
                  selectedCandidate?.id === candidate.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-600">
                        {candidate.name.split(' ').map(n => n.charAt(0)).join('')}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      {candidate.name}
                    </CardTitle>
                    <Badge variant="outline" className="mx-auto">
                      {candidate.party}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-center text-slate-600">
                      {candidate.description}
                    </CardDescription>
                    
                    {selectedCandidate?.id === candidate.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-2 bg-blue-50 rounded-lg text-center"
                      >
                        <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <span className="text-sm font-medium text-blue-700">Selected</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Vote Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleVoteConfirm}
              disabled={!selectedCandidate || isSubmitting}
              className="px-8 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Vote...
                </>
              ) : (
                <>
                  <Vote className="mr-2 h-5 w-5" />
                  Cast Your Vote
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              Are you sure you want to vote for {selectedCandidate?.name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                  <span className="font-bold text-slate-600">
                    {selectedCandidate.name.split(' ').map(n => n.charAt(0)).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{selectedCandidate.name}</p>
                  <p className="text-sm text-slate-600">{selectedCandidate.party}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowConfirmDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVoteSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Confirm;
