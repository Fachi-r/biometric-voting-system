import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { openBiometricAuth } from '@/store/slices/modalSlice';
import BiometricAuth from '@/components/BiometricAuth';
import Navbar from '@/components/Navbar';
import { Shield, Vote, Users, BarChart3, Fingerprint, Github, Twitter, Globe } from 'lucide-react';

const Index = () => {
  const dispatch = useDispatch();

  const handleRoleSelect = (role: 'voter' | 'admin') => {
    dispatch(openBiometricAuth(role));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />


      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-8 mb-16 stagger-item">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold">
                <span className="gradient-text">Secure</span> Blockchain
                <br />
                <span className="text-foreground">Voting Platform</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Revolutionary voting platform powered by blockchain technology, featuring biometric authentication 
                and transparent, immutable election records.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Fingerprint className="w-4 h-4 mr-2" />
                Biometric Auth
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Blockchain Secured
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Vote className="w-4 h-4 mr-2" />
                Transparent Voting
              </Badge>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card 
              className="role-card glass-card border-primary/20 cursor-pointer stagger-item"
              onClick={() => handleRoleSelect('voter')}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Vote className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Cast Your Vote</h3>
                <p className="text-muted-foreground mb-6">
                  Participate in secure, transparent elections. Your voice matters in shaping the future.
                </p>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0">
                  Enter as Voter
                  <Fingerprint className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="role-card glass-card border-secondary/20 cursor-pointer stagger-item"
              onClick={() => handleRoleSelect('admin')}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Manage Elections</h3>
                <p className="text-muted-foreground mb-6">
                  Create and oversee democratic processes. Ensure fair and transparent elections.
                </p>
                <Button className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 border-0">
                  Enter as Admin
                  <Fingerprint className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Section */}
          <Card className="glass-card border-border/50 stagger-item">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Vote className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">How It Works</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {/* Voter Instructions */}
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                      <Vote className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">For Voters</h3>
                    <div className="text-left space-y-2 text-muted-foreground">
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-0.5">1</span>
                        <span>Click "Enter as Voter" and complete biometric authentication</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-0.5">2</span>
                        <span>Connect your MetaMask wallet on the dashboard</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-0.5">3</span>
                        <span>Browse available elections and cast your vote</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-0.5">4</span>
                        <span>Confirm your vote in MetaMask to record it on blockchain</span>
                      </p>
                    </div>
                  </div>

                  {/* Admin Instructions */}
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold">For Administrators</h3>
                    <div className="text-left space-y-2 text-muted-foreground">
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center mt-0.5">1</span>
                        <span>Click "Enter as Admin" and complete biometric authentication</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center mt-0.5">2</span>
                        <span>Connect your MetaMask wallet to access admin features</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center mt-0.5">3</span>
                        <span>Create new elections with at least 2 candidates</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center mt-0.5">4</span>
                        <span>Monitor real-time analytics and manage elections</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> All transactions require MetaMask confirmation and will be recorded 
                    permanently on the blockchain for maximum transparency and security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">VoteForge</span>
              <span className="text-muted-foreground">© 2024</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-sm text-muted-foreground">Powered by:</span>
              <div className="flex space-x-4 text-xs text-muted-foreground">
                <span>React</span>
                <span>•</span>
                <span>Ethereum</span>
                <span>•</span>
                <span>Hardhat</span>
                <span>•</span>
                <span>MetaMask</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Biometric Auth Modal */}
      <BiometricAuth />
    </div>
  );
};

export default Index;