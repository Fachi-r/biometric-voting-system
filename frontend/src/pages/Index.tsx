import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Users, Shield, ChevronRight, Fingerprint } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConnectWallet } from '@/components/ConnectWallet'

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/80" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-blockchain" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-blockchain" style={{ animationDelay: '1s' }} />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">VoteForge</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ConnectWallet />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          {/* Hero Section */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-24 h-24 gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-glow"
            >
              <Fingerprint className="w-12 h-12 text-primary-foreground animate-pulse-blockchain" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Secure Blockchain Voting
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transparent, immutable, and trustworthy democratic participation
              <br />
              <span className="text-primary">powered by blockchain technology</span>
            </p>
          </div>

          {/* Role Selection Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"
          >
            {/* Voter Card */}
            <Link to="/voter">
              <Card className="p-8 gradient-card border-border/50 hover-lift hover-glow transition-smooth cursor-pointer group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center group-hover:shadow-glow transition-smooth">
                    <Users className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Voter Portal</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Cast your vote securely on active polls and view real-time results
                  </p>
                  
                  <Button 
                    className="w-full gradient-primary hover-glow transition-smooth group-hover:shadow-primary"
                    size="lg"
                  >
                    Enter as Voter
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Card>
            </Link>

            {/* Admin Card */}
            <Link to="/admin">
              <Card className="p-8 gradient-card border-border/50 hover-lift hover-glow transition-smooth cursor-pointer group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 gradient-secondary rounded-full mx-auto mb-4 flex items-center justify-center group-hover:shadow-glow transition-smooth">
                    <Shield className="w-8 h-8 text-secondary-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Admin Portal</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Create and manage polls, add candidates, and oversee elections
                  </p>
                  
                  <Button 
                    className="w-full gradient-secondary hover-glow transition-smooth group-hover:shadow-secondary"
                    size="lg"
                  >
                    Enter as Admin
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Card>
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            <div className="p-4">
              <div className="w-12 h-12 bg-success/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h4 className="font-semibold text-success mb-2">Immutable Results</h4>
              <p className="text-sm text-muted-foreground">All votes are permanently recorded on the blockchain</p>
            </div>
            
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Democratic Process</h4>
              <p className="text-sm text-muted-foreground">Fair and transparent voting for all participants</p>
            </div>
            
            <div className="p-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="font-semibold text-secondary mb-2">Secure Identity</h4>
              <p className="text-sm text-muted-foreground">Wallet-based authentication ensures voter integrity</p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;