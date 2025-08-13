import React from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { TARGET_CHAIN_ID } from '@/constants/votingContract';
import { Button } from '@/components/ui/button';

function truncate(addr: `0x${string}`) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const ConnectWallet: React.FC = () => {
  const { address, chain, isConnecting, isReconnecting } = useAccount();
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain, isPending: switching } = useSwitchChain();

  const wrongChain = !!chain && chain.id !== TARGET_CHAIN_ID;

  if (!address) {
    const metaMask = connectors.find(c => c.name.toLowerCase().includes('metamask')) ?? connectors[0];
    return (
      <div className="flex items-center gap-2">
        <Button
          aria-label="Connect Wallet"
          variant="outline"
          disabled={!metaMask || connectStatus === 'pending' || isConnecting || isReconnecting}
          onClick={() => metaMask && connect({ connector: metaMask })}
        >
          {connectStatus === 'pending' || isConnecting || isReconnecting ? 'Connecting…' : 'Connect Wallet'}
        </Button>
        {connectError && (
          <span role="alert" className="text-[hsl(var(--destructive))] text-sm">{(connectError as any)?.shortMessage ?? connectError?.message}</span>
        )}
      </div>
    );
  }

  if (wrongChain) {
    const target = chains.find(c => c.id === TARGET_CHAIN_ID);
    return (
      <div className="flex items-center gap-2">
        <Button aria-label="Switch Network" variant="secondary" disabled={switching} onClick={() => target && switchChain({ chainId: target.id })}>
          {switching ? 'Switching…' : `Switch to ${target?.name ?? TARGET_CHAIN_ID}`}
        </Button>
        <Button aria-label="Disconnect" variant="ghost" onClick={() => disconnect()}>Disconnect</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Connected: {truncate(address)}</span>
      <Button aria-label="Disconnect" variant="ghost" onClick={() => disconnect()}>Disconnect</Button>
    </div>
  );
};

export default ConnectWallet;
