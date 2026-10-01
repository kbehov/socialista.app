'use client'

import { cn } from '@/lib/utils'
import { useLayoutEffect, useRef, useState } from 'react'

type InfluencerProfileBioProps = {
  bio?: string
  identity: string
}

export function InfluencerProfileBio({ bio, identity }: InfluencerProfileBioProps) {
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el || expanded) return
    setCanExpand(el.scrollHeight > el.clientHeight + 1)
  }, [identity, expanded])

  if (!bio && !identity) return null

  return (
    <div className="mt-4 max-w-xl">
      {bio ? <p className="text-[14px] leading-snug tracking-[-0.01em]">{bio}</p> : null}
      {identity ? (
        <p
          ref={textRef}
          className={cn(
            'text-[13px] leading-relaxed text-muted-foreground',
            bio && 'mt-1',
            !expanded && 'line-clamp-4',
          )}
        >
          {identity}
        </p>
      ) : null}
      {canExpand || expanded ? (
        <button
          type="button"
          className="mt-0.5 text-[13px] font-semibold tracking-[-0.01em] text-foreground/80 transition-[opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:opacity-70"
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'less' : 'more'}
        </button>
      ) : null}
    </div>
  )
}
