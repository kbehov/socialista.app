'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { downloadGeneratedVideo } from '@/lib/video-generation/video-actions'
import { DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function UgcClipDownloadButton({ url, name }: { url: string; name?: string }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadGeneratedVideo(url, name)
      toast.success('Download started')
    } catch {
      toast.error('Could not download video')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      className="h-8 gap-1.5 px-3 text-[12px]"
      disabled={isDownloading}
      onClick={() => void handleDownload()}
      size="sm"
      type="button"
      variant="outline"
    >
      {isDownloading ? (
        <Spinner className="size-3.5" />
      ) : (
        <DownloadIcon className="size-3.5" />
      )}
      Download clip
    </Button>
  )
}
