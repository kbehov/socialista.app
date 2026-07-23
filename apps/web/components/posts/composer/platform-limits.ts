import type { SocialProvider } from '@socialista/types'

import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'

import type { PlatformLimitsMap } from './composer-types'

export const PLATFORM_LIMITS: PlatformLimitsMap = {
  instagram: {
    captionMax: 2200,
    mediaMax: 10,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['1:1', '4:5', '9:16'],
    videoMaxSeconds: 90,
    supportsTextOnly: false,
  },
  facebook: {
    captionMax: 63206,
    mediaMax: 10,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['1:1', '16:9', '4:5'],
    videoMaxSeconds: 240 * 60,
    supportsTextOnly: true,
  },
  twitter: {
    captionMax: 280,
    mediaMax: 4,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['16:9', '1:1'],
    videoMaxSeconds: 140,
    supportsTextOnly: true,
  },
  linkedin: {
    captionMax: 3000,
    mediaMax: 9,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['1:1', '16:9'],
    videoMaxSeconds: 10 * 60,
    supportsTextOnly: true,
  },
  tiktok: {
    captionMax: 2200,
    mediaMax: 35,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['9:16'],
    videoMaxSeconds: 10 * 60,
    supportsTextOnly: false,
  },
  youtube: {
    captionMax: 5000,
    mediaMax: 1,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['16:9', '9:16'],
    videoMaxSeconds: 60,
    supportsTextOnly: true,
  },
  pinterest: {
    captionMax: 500,
    mediaMax: 5,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['2:3', '1:1'],
    videoMaxSeconds: 15 * 60,
    supportsTextOnly: false,
  },
  threads: {
    captionMax: 500,
    mediaMax: 10,
    supportedKinds: ['image', 'video'],
    aspectRatios: ['1:1', '4:5', '9:16'],
    videoMaxSeconds: 5 * 60,
    supportsTextOnly: true,
  },
}

export function getPlatformLimits(provider: SocialProvider) {
  return PLATFORM_LIMITS[provider]
}

export function getStrictestCaptionLimit(providers: SocialProvider[]): number {
  if (providers.length === 0) return 2200
  return Math.min(...providers.map(provider => PLATFORM_LIMITS[provider].captionMax))
}

export function getProvidersRequiringMedia(providers: SocialProvider[]): SocialProvider[] {
  return providers.filter(provider => !PLATFORM_LIMITS[provider].supportsTextOnly)
}

export function formatProviderList(providers: SocialProvider[]): string {
  if (providers.length === 0) return ''
  const labels = providers.map(getSocialPlatformLabel)
  if (labels.length === 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}
