import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { contractService } from '@/services/contractService';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Candidate {
  name: string;
  image: string;
}

const CreatePollDialog = ({ open, onOpenChange, onSuccess }: CreatePollDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    startDate: '',
    endDate: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([
    { name: '', image: '' },
    { name: '', image: '' }
  ]);
  const [creating, setCreating] = useState(false);
  const wallet = useSelector((state: RootState) => state.wallet);

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

  const handlePollImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCandidateImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...candidates];
        updated[index].image = reader.result as string;
        setCandidates(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a poll.",
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
    
    if (startTime <= Date.now() / 1000) {
      toast({
        title: "Invalid Start Date",
        description: "Start date must be in the future.",
        variant: "destructive",
      });
      return;
    }

    if (endTime <= startTime) {
      toast({
        title: "Invalid End Date",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    
    try {
      // Store only filename reference on blockchain
      const imageReference = formData.image || 'default-poll.jpg';
      
      const pollTxHash = await contractService.createPoll({
        title: formData.title,
        description: formData.description,
        image: imageReference,
        startsAt: startTime,
        endsAt: endTime,
      });

      toast({
        title: "Poll Created!",
        description: `Transaction: ${pollTxHash.slice(0, 10)}...`,
      });

      // Get the poll ID (assuming it's the latest poll)
      const polls = await contractService.getPolls();
      const newPollId = Math.max(...polls.map(p => p.id));

      // Store poll image locally
      if (imagePreview) {
        localStorage.setItem(`poll_${newPollId}`, imagePreview);
      }

      // Add candidates to the poll
      for (const candidate of validCandidates) {
        try {
          // Store candidate image locally
          if (candidate.image) {
            localStorage.setItem(`candidate_${newPollId}_${candidate.name}`, candidate.image);
          }
          
          await contractService.joinContest(newPollId, {
            name: candidate.name,
            image: candidate.image ? `candidate_${candidate.name}.jpg` : '',
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

      // Reset form
      setFormData({
        title: '',
        description: '',
        image: '',
        startDate: '',
        endDate: '',
      });
      setCandidates([
        { name: '', image: '' },
        { name: '', image: '' }
      ]);
      setImagePreview('');

      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      toast({
        title: "Poll Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-secondary/20 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Create New Poll</DialogTitle>
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
              <label className="text-sm font-medium mb-2 block">Poll Image (Optional)</label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePollImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/50">
                    <img 
                      src={imagePreview} 
                      alt="Poll preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
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
                <div key={index} className="p-4 border border-border/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Candidate {index + 1}</h4>
                    {candidates.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCandidate(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <Input
                    placeholder="Candidate Name"
                    value={candidate.name}
                    onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                  />

                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCandidateImageChange(index, e)}
                      className="cursor-pointer"
                    />
                    {candidate.image && (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/50">
                        <img 
                          src={candidate.image} 
                          alt={`${candidate.name} preview`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit"
              disabled={creating}
              className="bg-gradient-to-r from-secondary to-secondary/80 flex-1"
            >
              {creating ? 'Creating Poll...' : 'Create Poll'}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;