import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, User, Loader2 } from 'lucide-react'
import { useContest } from '@/hooks/voting'
import { useState } from 'react'

interface ContestantAddProps {
  pollId: number
  onClose: () => void
}

export function ContestantAdd({ pollId, onClose }: ContestantAddProps) {
  const { contest, isLoading } = useContest()
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await contest(
      pollId,
      formData.name,
      formData.image || 'https://via.placeholder.com/200x200'
    )
    
    if (!isLoading) {
      onClose()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Candidate</DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Card className="p-6 gradient-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Candidate Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Candidate Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter candidate name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-sm font-medium">
                  Image URL (Optional)
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/candidate-photo.jpg"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gradient-primary hover-glow transition-smooth"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Candidate'
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}