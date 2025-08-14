import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Vote, Clock, Users, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConnectWallet } from '@/components/ConnectWallet'
import { PollList } from '@/components/PollList'
import { useAccount } from 'wagmi'

const Voter = () => {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background/80">
      {/* Header */}
      <header className="p-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover-lift">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Vote className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Voter Portal</h1>
            </motion.div>
          </div>
          
          <ConnectWallet />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <Card className="max-w-md mx-auto p-8 gradient-card border-border/50">
              <div className="w-16 h-16 bg-warning/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Vote className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Please connect your MetaMask wallet to participate in voting
              </p>
              <ConnectWallet />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 gradient-card border-border/50 hover-lift transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Vote className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Polls</p>
                    <p className="text-2xl font-bold text-primary">Loading...</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card border-border/50 hover-lift transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Votes</p>
                    <p className="text-2xl font-bold text-success">Loading...</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card border-border/50 hover-lift transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Voters</p>
                    <p className="text-2xl font-bold text-secondary">Loading...</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Polls Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Available Polls</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Live voting</span>
                </div>
              </div>

              <PollList mode="voter" />
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Voter;