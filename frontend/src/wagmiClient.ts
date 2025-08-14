import { http, createConfig } from 'wagmi'
import { hardhat, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { TARGET_CHAIN_ID, LOCAL_RPC_URL } from './constants/votingContract'

// Define Hardhat localhost chain
const hardhatLocalhost = {
  ...hardhat,
  id: TARGET_CHAIN_ID,
  rpcUrls: {
    default: { http: [LOCAL_RPC_URL] },
    public: { http: [LOCAL_RPC_URL] },
  },
} as const

export const config = createConfig({
  chains: [hardhatLocalhost, mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [hardhatLocalhost.id]: http(LOCAL_RPC_URL),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}