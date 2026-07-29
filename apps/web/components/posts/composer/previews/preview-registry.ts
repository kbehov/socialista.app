'use client'

import type { SocialProvider } from '@socialista/types'
import { createElement, type ComponentType } from 'react'

import type { PreviewProps } from '@/types/composer-types'
import { FacebookPreview } from './facebook-preview'
import { InstagramPreview } from './instagram-preview'
import { LinkedInPreview } from './linkedin-preview'
import { PinterestPreview } from './pinterest-preview'
import { PostPreviewGeneric } from './post-preview-generic'
import { ThreadsPreview } from './threads-preview'
import { TikTokPreview } from './tiktok-preview'
import { TwitterPreview } from './twitter-preview'
import { YouTubePreview } from './youtube-preview'

export const PREVIEW_REGISTRY: Record<SocialProvider, ComponentType<PreviewProps>> = {
  instagram: InstagramPreview,
  facebook: FacebookPreview,
  twitter: TwitterPreview,
  linkedin: LinkedInPreview,
  tiktok: TikTokPreview,
  youtube: YouTubePreview,
  pinterest: PinterestPreview,
  threads: ThreadsPreview,
}

export function getPreviewComponent(provider: SocialProvider): ComponentType<PreviewProps> {
  return PREVIEW_REGISTRY[provider] ?? PostPreviewGeneric
}

/** Stable wrapper so callers never assign a dynamic component type during render. */
export function PlatformPreview({
  provider,
  ...props
}: PreviewProps & { provider: SocialProvider }) {
  return createElement(getPreviewComponent(provider), props)
}
