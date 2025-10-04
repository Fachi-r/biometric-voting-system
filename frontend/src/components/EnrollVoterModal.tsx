import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Loader2, CheckCircle, XCircle, Users, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useWebSocket, { WEBSOCKET_URL } from '@/hooks/use-websocket';

interface EnrollVoterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RegisteredVoter {
  id: string;
  name: string;
  walletAddress: string;
  fingerprintId: string;
  registeredAt: Date;
}

const EnrollVoterModal = ({ open, onOpenChange }: EnrollVoterModalProps) => {
  const [enrollmentStep, setEnrollmentStep] = useState<'input' | 'scanning' | 'success' | 'error'>('input');
  const [voterName, setVoterName] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [registeredVoters, setRegisteredVoters] = useState<RegisteredVoter[]>([]);

  const { fingerprintStatus } = useWebSocket();
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // This runs immediately the component mounts


  }, []);

  // Load registered voters from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('registeredVoters');
    if (stored) {
      const parsed = JSON.parse(stored).map((v: RegisteredVoter) => ({
        ...v,
        registeredAt: new Date(v.registeredAt),
      }));
      setRegisteredVoters(parsed);
    }
  }, []);

  // Save registered voters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('registeredVoters', JSON.stringify(registeredVoters));
  }, [registeredVoters]);

  const isValidAddress = (address: string) => {
    return address.match(/^0x[a-fA-F0-9]{40}$/);
  };

  const startFingerprint = () => {
    if (!voterName.trim()) {
      toast({ title: "Missing Name", description: "Please enter the voter's name", variant: "destructive" });
      return;
    }

    if (!voterAddress.trim()) {
      toast({ title: "Missing Address", description: "Please enter a wallet address", variant: "destructive" });
      return;
    }

    if (!isValidAddress(voterAddress)) {
      toast({ title: "Invalid Address", description: "Please enter a valid Ethereum wallet address", variant: "destructive" });
      return;
    }

    const existing = registeredVoters.find(v =>
      v.walletAddress.toLowerCase() === voterAddress.toLowerCase()
    );
    if (existing) {
      toast({ title: "Already Registered", description: "This wallet address is already registered", variant: "destructive" });
      return;
    }

    // Flip into scanning mode
    fetch(`${WEBSOCKET_URL}/fingerprint/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fingerprint scan initiated:', data);
      })

    setEnrollmentStep('scanning');
    setIsScanning(true);
    setScanProgress(0);
  };

  // React to fingerprint device status
  useEffect(() => {
    if (enrollmentStep !== 'scanning') return;
    if (!fingerprintStatus?.status) return;

    switch (fingerprintStatus.status) {
      case 'place_finger':
      case 'place_finger_again':
        // show scanning spinner but don’t advance progress
        break;

      case 'image_taken':
      case 'image_taken_again':
      case 'model_created':
      case 'stored':
      case 'downloading_template':
        setScanProgress((prev) => Math.min(prev + 20, 100));
        break;

      case 'success':
        setScanProgress(100);
        // Register new voter
        const newVoter: RegisteredVoter = {
          id: Date.now().toString(),
          name: voterName,
          walletAddress: voterAddress,
          fingerprintId: `FP_${Date.now()}`, // device could eventually supply this
          registeredAt: new Date()
        };
        setRegisteredVoters(prev => [newVoter, ...prev]);
        setEnrollmentStep('success');
        toast({
          title: "✅ Voter Registered Successfully",
          description: `Voter ${voterName} (${voterAddress.slice(0, 6)}...${voterAddress.slice(-4)}) has been enrolled`,
        });

        setTimeout(() => {
          resetEnrollment()
        }, 300);
        break;

      case 'error':
        setEnrollmentStep('error');
        setScanProgress(0);
        toast({
          title: "❌ Failed to Capture Fingerprint",
          description: "Please try again with better finger placement",
          variant: "destructive",
        });
        break;

      default:
        break;
    }
  }, [fingerprintStatus, enrollmentStep, voterName, voterAddress]);

  const resetEnrollment = () => {
    setEnrollmentStep('input');
    setVoterName('');
    setVoterAddress('');
    setScanProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center space-x-2">
            <Fingerprint className="w-5 h-5" />
            <span>Voter Enrollment System</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side - Enrollment */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <span>Enroll New Voter</span>
                </h3>

                {enrollmentStep === 'input' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Voter Name</label>
                      <Input
                        placeholder="Full Name"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Wallet Address</label>
                      <Input
                        placeholder="0x..."
                        value={voterAddress}
                        onChange={(e) => setVoterAddress(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button
                      onClick={startFingerprint}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      disabled={!voterName.trim() || !voterAddress.trim()}
                    >
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Start Fingerprint Enrollment
                    </Button>
                  </div>
                )}

                {enrollmentStep === 'scanning' && (
                  <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <Fingerprint
                        className="w-24 h-24 text-primary animate-pulse"
                      />
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-t-primary transition-all duration-100 ease-linear"
                          style={{ transform: `rotate(${(scanProgress / 100) * 360}deg)` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-primary mb-2">
                        {scanProgress}%
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {fingerprintStatus?.status === 'place_finger'
                          ? "Please place your finger on the scanner..."
                          : "Scanning fingerprint..."}
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100 ease-linear"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Waiting for scanner...</span>
                    </div>
                  </div>
                )}

                {enrollmentStep === 'success' && (
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-success mx-auto" />
                    <div>
                      <h4 className="text-lg font-semibold text-success mb-2">
                        ✅ Voter Registered Successfully
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Voter {voterName} ({voterAddress.slice(0, 6)}...{voterAddress.slice(-4)}) has been enrolled
                      </p>
                    </div>
                  </div>
                )}

                {enrollmentStep === 'error' && (
                  <div className="text-center space-y-4">
                    <XCircle className="w-16 h-16 text-destructive mx-auto" />
                    <div>
                      <h4 className="text-lg font-semibold text-destructive mb-2">
                        ❌ Failed to Capture Fingerprint
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please ensure your finger is clean and dry, then try again
                      </p>
                      <Button
                        onClick={resetEnrollment}
                        variant="outline"
                        className="text-primary border-primary/50 hover:bg-primary/10"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Registered Voters */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Registered Voters</span>
                  </h3>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {registeredVoters.map((voter) => (
                    <div key={voter.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {voter.name}
                        </div>
                        <div className="font-mono text-xs">
                          {voter.walletAddress.slice(0, 6)}...{voter.walletAddress.slice(-4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {voter.fingerprintId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {voter.registeredAt.toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-success border-success/50 text-xs">
                          Active
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {registeredVoters.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No voters registered yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollVoterModal;
