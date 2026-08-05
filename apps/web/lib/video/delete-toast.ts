import { toast } from 'sonner'
import { useVideoEditorStore } from '@/lib/video/store'

export function showVideoDeleteUndoToast(message: string): void {
  toast(message, {
    duration: 5000,
    action: {
      label: 'Undo',
      onClick: () => useVideoEditorStore.getState().undo(),
    },
  })
}
