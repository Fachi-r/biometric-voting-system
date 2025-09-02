import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { contractService, Poll } from '@/services/contractService';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UpdatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  poll: Poll | null;
}

interface Candidate {
  name: string;
  image: string;
}

const UpdatePollDialog = ({ open, onOpenChange, onSuccess, poll }: UpdatePollDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    startDate: '',
    endDate: '',
  });
  const [candidates, setCandidates] = useState<Candidate[]>([
    { name: '', image: '' },
    { name: '', image: '' }
  ]);
  const [updating, setUpdating] = useState(false);
  const wallet = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    if (poll && open) {
      setFormData({
        title: poll.title,
        description: poll.description,
        image: poll.image,
        startDate: new Date(poll.startsAt * 1000).toISOString().slice(0, 16),
        endDate: new Date(poll.endsAt * 1000).toISOString().slice(0, 16),
      });

      // Load existing candidates
      loadCandidates();
    }
  }, [poll, open]);

  const loadCandidates = async () => {
    if (!poll) return;
    try {
      const contestants = await contractService.getContestants(poll.id);
      const candidateData = contestants.map(c => ({ name: c.name, image: c.image }));
      setCandidates(candidateData.length >= 2 ? candidateData : [
        { name: '', image: '' },
        { name: '', image: '' }
      ]);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([{ name: '', image: '' }, { name: '', image: '' }]);
    }
  };

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', image: '' }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, field: keyof Candidate, value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.address || !poll) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to update a poll.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Dates",
        description: "Please set start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const validCandidates = candidates.filter(c => c.name.trim());
    if (validCandidates.length < 2) {
      toast({
        title: "Not Enough Candidates",
        description: "Please add at least 2 candidates.",
        variant: "destructive",
      });
      return;
    }

    const startTime = Math.floor(new Date(formData.startDate).getTime() / 1000);
    const endTime = Math.floor(new Date(formData.endDate).getTime() / 1000);
    
    if (endTime <= startTime) {
      toast({
        title: "Invalid End Date",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    
    try {
      // Update the poll
      const pollTxHash = await contractService.updatePoll(poll.id, {
        title: formData.title,
        description: formData.description,
        image: formData.image || '',
        startsAt: startTime,
        endsAt: endTime,
      });

      toast({
        title: "Poll Updated!",
        description: `Transaction: Poll Update - ${pollTxHash.slice(0, 10)}...`,
      });

      // Add new candidates to the poll
      const existingContestants = await contractService.getContestants(poll.id);
      const existingNames = existingContestants.map(c => c.name.toLowerCase());
      
      for (const candidate of validCandidates) {
        if (!existingNames.includes(candidate.name.toLowerCase())) {
          try {
            const candidateTxHash = await contractService.joinContest(poll.id, {
              name: candidate.name,
              image: candidate.image || '',
            });
            
            toast({
              title: "Candidate Added!",
              description: `Transaction: Candidate Addition - ${candidateTxHash.slice(0, 10)}...`,
            });
          } catch (error: any) {
            console.error(`Error adding candidate ${candidate.name}:`, error);
            toast({
              title: "Candidate Addition Failed",
              description: `Failed to add ${candidate.name}: ${error.message}`,
              variant: "destructive",
            });
          }
        }
      }

      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      toast({
        title: "Poll Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-secondary/20 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Update Poll</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Poll Title *</label>
              <Input 
                placeholder="Enter poll title" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Image URL</label>
              <Input 
                placeholder="https://example.com/image.jpg" 
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <Textarea 
              placeholder="Describe the poll purpose and voting process..." 
              rows={3} 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date *</label>
              <Input 
                type="datetime-local" 
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date *</label>
              <Input 
                type="datetime-local" 
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Candidates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Candidates (Minimum 2 required) *</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCandidate}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </div>
            
            <div className="space-y-3">
              {candidates.map((candidate, index) => (
                <div key={index} className="flex space-x-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder={`Candidate ${index + 1} name`}
                      value={candidate.name}
                      onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Avatar URL (optional)"
                      value={candidate.image}
                      onChange={(e) => updateCandidate(index, 'image', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCandidate(index)}
                    disabled={candidates.length <= 2}
                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit"
              disabled={updating}
              className="bg-gradient-to-r from-secondary to-secondary/80 flex-1"
            >
              {updating ? 'Updating Poll...' : 'Update Poll'}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePollDialog;