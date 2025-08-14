import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Calendar, Loader2 } from 'lucide-react'
import { useUpdatePoll, usePoll } from '@/hooks/voting'
import { useState, useEffect } from 'react'

interface PollUpdateProps {
  pollId: number
  onClose: () => void
}

export function PollUpdate({ pollId, onClose }: PollUpdateProps) {
  const { updatePoll, isLoading } = useUpdatePoll()
  const { data: poll } = usePoll(pollId)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    startsAt: '',
    endsAt: ''
  })

  useEffect(() => {
    if (poll) {
      const formatDateForInput = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000)
        return date.toISOString().slice(0, 16)
      }

      setFormData({
        title: poll.title,
        description: poll.description,
        image: poll.image,
        startsAt: formatDateForInput(poll.startsAt),
        endsAt: formatDateForInput(poll.endsAt)
      })
    }
  }, [poll])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const startsAt = Math.floor(new Date(formData.startsAt).getTime() / 1000)
    const endsAt = Math.floor(new Date(formData.endsAt).getTime() / 1000)
    
    if (startsAt >= endsAt) {
      alert('End date must be after start date')
      return
    }
    
    await updatePoll(
      pollId,
      formData.image,
      formData.title,
      formData.description,
      startsAt,
      endsAt
    )
    
    if (!isLoading) {
      onClose()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!poll) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md gradient-card border-border/50">
          <div className="p-8 text-center">
            <p>Loading poll data...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Update Poll</DialogTitle>
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Poll Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter poll title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this poll is about"
                  required
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-sm font-medium">
                  Image URL
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/poll-image.jpg"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 gradient-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Poll Duration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt" className="text-sm font-medium">
                  Start Date & Time *
                </Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endsAt" className="text-sm font-medium">
                  End Date & Time *
                </Label>
                <Input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3 pt-4">
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
                  Updating...
                </>
              ) : (
                'Update Poll'
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}