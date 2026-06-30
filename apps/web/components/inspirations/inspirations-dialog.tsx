import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
const InspirationsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Start with template</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inspirations</DialogTitle>
          <DialogDescription>Select an inspiration to start with</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default InspirationsDialog
