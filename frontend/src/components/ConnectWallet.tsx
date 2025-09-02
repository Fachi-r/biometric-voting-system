import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, ChevronDown } from 'lucide-react'
import { TARGET_CHAIN_ID } from '@/constants/votingContract'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Auto-switch to Hardhat chain if connected to wrong network
  useEffect(() => {
    if (isConnected && chain?.id !== TARGET_CHAIN_ID) {
      switchChain({ chainId: TARGET_CHAIN_ID })
    }
  }, [isConnected, chain?.id, switchChain])

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => {
            const connector = connectors[0]
            if (connector) {
              connect({ connector })
            }
          }}
          className="gradient-primary hover-glow transition-smooth"
          size="lg"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </motion.div>
    )
  }

  const isWrongNetwork = chain?.id !== TARGET_CHAIN_ID

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2"
    >
      {isWrongNetwork && (
        <Button
          onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
          variant="destructive"
          size="sm"
        >
          Switch to Hardhat
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="hover-lift transition-smooth"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {truncateAddress(address!)}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="gradient-card border-border/50">
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}