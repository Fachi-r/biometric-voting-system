
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'voter' | 'admin';
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isWalletConnected: boolean;
  login: (biometricData: any) => Promise<boolean>;
  logout: () => void;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Check for existing wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Simulate biometric authentication using WebAuthn API
  const login = async (biometricData: any): Promise<boolean> => {
    try {
      // Simulate WebAuthn biometric authentication
      console.log('Simulating biometric authentication...');
      
      // In a real app, this would interact with WebAuthn API
      // const credential = await navigator.credentials.create({
      //   publicKey: {
      //     challenge: new Uint8Array(32),
      //     rp: { name: "Voting DApp" },
      //     user: { id: new Uint8Array(16), name: "user@example.com", displayName: "User" },
      //     pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      //     authenticatorSelection: { authenticatorAttachment: "platform" }
      //   }
      // });
      
      // Simulate successful biometric authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock user data based on biometric scan
      const mockUser: User = {
        id: '1',
        name: 'TWANGE CHANSA',
        email: 'twange.tc@institution.edu',
        role: biometricData?.isAdmin ? 'admin' : 'voter'
      };

      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setWalletAddress('');
  };

  // Connect to MetaMask wallet
  const connectWallet = async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          if (user) {
            setUser({ ...user, walletAddress: accounts[0] });
          }
          return true;
        }
      } else {
        console.error('MetaMask is not installed');
        return false;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
    return false;
  };

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    if (user) {
      setUser({ ...user, walletAddress: undefined });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isWalletConnected: !!walletAddress,
    login,
    logout,
    connectWallet,
    disconnectWallet,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
