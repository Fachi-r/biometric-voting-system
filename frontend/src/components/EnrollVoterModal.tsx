import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Loader2, CheckCircle, XCircle, Users, UserPlus, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { contractService, VoterData } from '@/services/contractService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import useWebSocket, { WEBSOCKET_URL } from '@/hooks/use-websocket';

interface EnrollVoterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnrollVoterModal = ({ open, onOpenChange }: EnrollVoterModalProps) => {
  const [enrollmentStep, setEnrollmentStep] = useState<'input' | 'scanning' | 'confirming' | 'success' | 'error'>('input');
  const [voterAddress, setVoterAddress] = useState('');
  const [voterName, setVoterName] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [registeredVoters, setRegisteredVoters] = useState<VoterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const { address: connectedAddress } = useSelector((state: RootState) => state.wallet);

  // Load registered voters from blockchain
  const loadVoters = async () => {
    try {
      setIsLoading(true);
      const voters = await contractService.getAllVoters();
      setRegisteredVoters(voters);
    } catch (error: any) {
      console.error('Failed to load voters:', error);
      toast({
        title: "Failed to Load Voters",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load voters when modal opens
  useEffect(() => {
    if (open) {
      loadVoters();
    }
    fetch(`${WEBSOCKET_URL}/fingerprint/enrolled`, { headers: { 'Content-Type': 'application/json' } })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Enrollment count requested:', data);
      })
  }, [open]);

  const isValidAddress = (address: string) => {
    return address.match(/^0x[a-fA-F0-9]{40}$/);
  };

  const startFingerprint = async () => {
    if (!voterAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    if (!voterName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter voter's name",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAddress(voterAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if already registered on blockchain
      const isRegistered = await contractService.isVoterRegistered(voterAddress);
      if (isRegistered) {
        toast({
          title: "Already Registered",
          description: "This wallet address is already registered on the blockchain",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      // Continue if we can't check (user might not be connected)
    }

    fetch(`${WEBSOCKET_URL}/fingerprint/enroll`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: fingerprintCount
      })
    })
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
    setScanProgress(0);

    // Simulate fingerprint scanning
    // const interval = setInterval(() => {
    //   setScanProgress((prev) => {
    //     if (prev >= 100) {
    //       clearInterval(interval);
    //       // Simulate successful fingerprint capture
    //       registerVoterOnBlockchain();
    //       return 100;
    //     }
    //     return prev + 4;
    //   });
    // }, 50);
  };

  const registerVoterOnBlockchain = async () => {
    try {
      setEnrollmentStep('confirming');

      // Generate unique fingerprint ID
      const hashedTemplate = fingerprintTemplate?.template // TODO: Add Hashing function here
      const fingerprintHash = hashedTemplate;
      const fingerprintId = fingerprintTemplate?.id

      toast({
        title: "📝 Enrolling voter with fingerprint…",
        description: "Please confirm the transaction in MetaMask",
      });

      const txHash = await contractService.registerVoter({
        voterAddress,
        name: voterName,
        fingerprintId,
        fingerprintHash,
      });

      setTxHash(txHash);
      setEnrollmentStep('success');

      toast({
        title: "✅ Voter registered successfully",
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      // Refresh voter list
      await loadVoters();

      // Reset form after delay
      setTimeout(() => {
        resetEnrollment();
      }, 3000);

    } catch (error: any) {
      setEnrollmentStep('error');
      toast({
        title: "❌ Failed to register voter",
        description: error.message || "Please try again",
        variant: "destructive",
      });

      setTimeout(() => {
        resetEnrollment();
      }, 3000);
    }
  };

  const resetEnrollment = () => {
    setEnrollmentStep('input');
    setVoterAddress('');
    setVoterName('');
    setScanProgress(0);
    setTxHash('');
  };

  const { fingerprintStatus, fingerprintCount, fingerprintTemplate } = useWebSocket()

  // React to fingerprint status updates
  useEffect(() => {
    if (!open) return;
    console.log("Status: ", fingerprintStatus);
    console.log("Count: ", fingerprintCount);
    console.log("Template: ", fingerprintTemplate);

    switch (fingerprintStatus.status) {
      case 'place_finger':
      case 'place_finger_again':
        setEnrollmentStep('scanning');
        setScanProgress((prev) => Math.min(prev + 10, 100));
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
        setTimeout(() => {
          registerVoterOnBlockchain();
          setEnrollmentStep('input');
        }, 1000);
        break;

      case 'error':
        setEnrollmentStep('input');
        // setIsScanning(false);
        setScanProgress(0);
        // optional: show error toast
        toast({
          title: "Fingerprint Error",
          description: fingerprintStatus.message,
          variant: "destructive",
        });
        break;

      default:
        break;
    }
  }, [fingerprintStatus, open]);


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
                        placeholder="Enter voter's full name"
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
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      disabled={!voterAddress.trim() || !voterName.trim()}
                    >
                      <Fingerprint className="w-4 h-4 mr-2" />ard

                      Start Fingerprint Enrollment
                    </Button>
                  </div>
                )}

                {enrollmentStep === 'scanning' && (
                  <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <Fingerprint
                        className="w-24 h-24 text-primary fingerprint-scanner"
                      />
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-t-primary transition-all duration-75 ease-linear"
                          style={{
                            transform: `rotate(${(scanProgress / 100) * 360}deg)`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-primary mb-2">
                        {scanProgress}%
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Please hold your finger steady on the scanner...
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-75 ease-linear"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{fingerprintStatus.message ?? "Enrolling voter with fingerprint…"}</span>
                    </div>
                  </div>
                )}

                {enrollmentStep === 'confirming' && (
                  <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <Wallet className="w-24 h-24 text-secondary blockchain-pulse" />
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-secondary mb-2">
                        🔗 Confirm in MetaMask
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please confirm the voter registration transaction in your wallet
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Waiting for blockchain confirmation...</span>
                    </div>
                  </div>
                )}

                {enrollmentStep === 'success' && (
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-success mx-auto" />
                    <div>
                      <h4 className="text-lg font-semibold text-success mb-2">
                        ✅ Voter registered successfully
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {voterName} ({voterAddress.slice(0, 6)}...{voterAddress.slice(-4)}) has been enrolled on the blockchain
                      </p>
                      {txHash && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {enrollmentStep === 'error' && (
                  <div className="text-center space-y-4">
                    <XCircle className="w-16 h-16 text-destructive mx-auto" />
                    <div>
                      <h4 className="text-lg font-semibold text-destructive mb-2">
                        ❌ Failed to register voter
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Transaction failed or was cancelled. Please try again.
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
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {registeredVoters.length} Total
                  </Badge>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading voters...</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {registeredVoters.map((voter) => (
                      <div key={voter.voterId} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50">
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">
                            {voter.name}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {voter.voterAddress.slice(0, 6)}...{voter.voterAddress.slice(-4)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fingerprint ID: {voter.fingerprintId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">
                            Voter #{voter.voterId}
                          </div>
                          <Badge variant="outline" className="text-success border-success/50 text-xs">
                            Registered
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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