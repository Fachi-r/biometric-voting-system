import { ethers } from 'ethers';

export interface WalletConnection {
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  address: string;
  balance: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const walletService = {
  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  },

  // Connect to Hardhat wallet (Prompts for account selection)
  async connectAdminWallet(): Promise<WalletConnection> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if we're on the correct network first
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
        await this.switchToHardhatNetwork();
      }

      // Always prompt user to select account
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      // Get the selected accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts selected');
      }

      const signer = await provider.getSigner(accounts[0]); // Use selected account
      const address = accounts[0];
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      return {
        provider,
        signer,
        address,
        balance: balanceInEth,
      };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Please connect to MetaMask.');
      }
      throw new Error(`Failed to connect admin wallet: ${error.message}`);
    }
  },

  // Connect to Hardhat wallet (Prompts for account selection)
  async connectVoterWallet(): Promise<WalletConnection> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if we're on the correct network first
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
        await this.switchToHardhatNetwork();
      }

      // Always prompt user to select account
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      // Get the selected accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts selected');
      }

      const signer = await provider.getSigner(accounts[0]); // Use selected account
      const address = accounts[0];
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      return {
        provider,
        signer,
        address,
        balance: balanceInEth,
      };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Please connect to MetaMask.');
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  },

  // Switch to Hardhat local network
  async switchToHardhatNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7A69',
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  },

  // Get current account
  async getCurrentAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  },

  // Get balance for an address
  async getBalance(address: string): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  },

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  },

  // Listen for network changes
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  },

  // Remove event listeners
  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  },

  // Disconnect wallet (clear local state)
  async disconnectWallet(): Promise<void> {
    this.removeAllListeners();
    // Note: MetaMask doesn't have a disconnect method, so we just clear our local state
  },
};