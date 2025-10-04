import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '@/store';
import { connectWallet, disconnectWallet, updateBalance, setError, setLoading } from '@/store/slices/walletSlice';
import { walletService } from '@/services/walletService';
import { contractService } from '@/services/contractService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Wallet, LogOut, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useSelector((state: RootState) => state.wallet);
  
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin-dashboard';
  const isVoterPage = location.pathname === '/voter-dashboard';

  useEffect(() => {
    // Setup event listeners for wallet changes
    if (isVoterPage || isAdminPage) {
      walletService.onAccountsChanged(handleAccountsChanged);
      walletService.onChainChanged(handleChainChanged);

      return () => {
        walletService.removeAllListeners();
      };
    }
  }, [isVoterPage, isAdminPage]);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      dispatch(disconnectWallet());
      toast({
        title: "Account Disconnected",
        description: "Please reconnect your wallet.",
        variant: "destructive",
      });
      navigate('/');
    } else if (wallet.address && accounts[0] !== wallet.address) {
      // Account changed, reconnect with new account
      await handleWalletConnect();
    }
  };

  const handleChainChanged = async (chainId: string) => {
    // Force page reload when chain changes to reset state
    window.location.reload();
  };

  const handleWalletConnect = async () => {
    dispatch(setLoading(true));
    
    try {
      if (!walletService.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const connection = await walletService.connectVoterWallet();
      
      // Initialize contract service
      await contractService.initialize(connection.signer);
      
      dispatch(connectWallet({
        address: connection.address,
        balance: connection.balance,
        provider: connection.provider,
        signer: connection.signer,
        account: connection.address,
        isAdmin: false, // Will be determined by route context
      }));

      toast({
        title: "Wallet Connected",
        description: `Connected to ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
      });
    } catch (error: any) {
      dispatch(setError(error.message));
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await walletService.disconnectWallet();
      dispatch(disconnectWallet());
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected safely.",
      });

      // Redirect to home page after disconnect and refresh if coming from dashboard
      if (isAdminPage || isVoterPage) {
        navigate('/');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!walletService.isMetaMaskInstalled() && !isHomePage) {
    return (
      <header className="relative z-10 border-b border-border/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">VoteForge</h1>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-muted-foreground">MetaMask Required</p>
              <Button
                onClick={() => window.open('https://metamask.io/', '_blank')}
                className="bg-gradient-to-r from-primary to-primary/80"
                size="sm"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Install MetaMask
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-10 border-b border-border/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button + Title */}
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Shield className={`w-6 h-6 ${isAdminPage ? 'text-secondary' : 'text-primary'}`} />
              <h1 className="text-xl font-bold">
                {isAdminPage ? 'Admin Dashboard' : isVoterPage ? 'Voter Dashboard' : 'VoteForge'}
              </h1>
            </div>
          </div>

          {/* Right side - Wallet Connection */}
          <div className="flex items-center space-x-4">
            {wallet.isConnected && wallet.address ? (
              <>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-success/50 text-success">
                    {isAdminPage ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      'Connected'
                    )}
                  </Badge>
                  <span className="text-sm font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>{parseFloat(wallet.balance || '0').toFixed(4)} ETH</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWalletDisconnect}
                  className="border-success/50 text-success hover:bg-success/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleWalletConnect}
                disabled={wallet.isLoading}
                className={isAdminPage 
                  ? "bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                  : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                }
              >
                {isAdminPage ? <Shield className="w-4 h-4 mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                {wallet.isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;