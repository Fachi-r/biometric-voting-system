
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Shield, Vote } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isWalletConnected, connectWallet, logout } = useAuth();

  const handleWalletConnect = async () => {
    const success = await connectWallet();
    if (!success) {
      alert('Failed to connect wallet. Please make sure MetaMask is installed.');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SecureVote</h1>
              <p className="text-sm text-slate-600">Biometric Blockchain Voting</p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {user?.role === 'admin' && (
                      <Shield className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-slate-700 font-medium">{user?.name}</span>
                  </div>
                </div>

                {/* Wallet Connection */}
                {!isWalletConnected ? (
                  <Button
                    onClick={handleWalletConnect}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {truncateAddress(user?.walletAddress || '')}
                    </span>
                  </div>
                )}

                {/* Admin Panel Link */}
                {user?.role === 'admin' && location.pathname !== '/admin' && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Button>
                )}

                {/* Logout */}
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
