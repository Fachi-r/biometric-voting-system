import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { hardhat } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [hardhat],
  connectors: [injected({ target: 'metaMask' })],
  transports: {
    [hardhat.id]: http(import.meta.env.VITE_LOCAL_RPC_URL || 'http://localhost:8545'),
  },
});
