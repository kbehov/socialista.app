'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SparklesIcon } from 'lucide-react'

export type AiComingSoonFeature =
  | 'auto-caption'
  | 'auto-reframe'
  | 'smart-text'
  | 'smart-layout'

const FEATURE_COPY: Record<
  AiComingSoonFeature,
  { title: string; description: string }
> = {
  'auto-caption': {
    title: 'Auto-caption',
    description:
      'Automatically transcribe speech and add timed captions anchored to the safe area — perfect for Reels and TikTok.',
  },
  'auto-reframe': {
    title: 'Auto-reframe',
    description:
      'AI will detect the subject and reposition your clip for vertical short-form — keeping faces and products in frame.',
  },
  'smart-text': {
    title: 'Generate caption',
    description:
      'Get AI-written hook lines and call-to-action text tailored to your video and brand voice.',
  },
  'smart-layout': {
    title: 'Auto-arrange',
    description:
      'Smart layout will position multiple clips as a polished collage — no manual resizing required.',
  },
}

type AiComingSoonContextValue = {
  open: (feature: AiComingSoonFeature) => void
}

const AiComingSoonContext = createContext<AiComingSoonContextValue | null>(null)

export function AiComingSoonProvider({ children }: { children: ReactNode }) {
  const [feature, setFeature] = useState<AiComingSoonFeature | null>(null)

  const open = useCallback((next: AiComingSoonFeature) => {
    setFeature(next)
  }, [])

  const value = useMemo(() => ({ open }), [open])
  const copy = feature ? FEATURE_COPY[feature] : null

  return (
    <AiComingSoonContext.Provider value={value}>
      {children}
      <Dialog open={feature !== null} onOpenChange={openState => !openState && setFeature(null)}>
        <DialogContent className="sm:max-w-md">
          {copy ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <SparklesIcon className="size-4 text-primary" />
                  {copy.title}
                </DialogTitle>
                <DialogDescription>{copy.description}</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                This AI feature is coming soon. We&apos;re building it to keep editing fast and approachable for
                marketing teams — not pro editors.
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AiComingSoonContext.Provider>
  )
}

export function useAiComingSoon(): AiComingSoonContextValue {
  const ctx = useContext(AiComingSoonContext)
  if (!ctx) {
    throw new Error('useAiComingSoon must be used within AiComingSoonProvider')
  }
  return ctx
}

export function useAiComingSoonOptional(): AiComingSoonContextValue | null {
  return useContext(AiComingSoonContext)
}
