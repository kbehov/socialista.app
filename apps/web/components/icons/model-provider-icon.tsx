import { ModelSelectorLogo } from '@/components/ai-elements/model-selector'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

import { ByteDanceIcon } from './bytedance-icon'
import { GoogleIcon } from './google-icon'
import { OpenAIIcon } from './openai-icon'
import type { ProviderIconProps } from './types'
import { XaiIcon } from './xai-icon'

export type ModelProviderId = 'openai' | 'google' | 'bytedance' | 'xai'

export function normalizeModelProvider(provider: string): string {
  return provider.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
}

export function resolveModelProviderId(provider: string): ModelProviderId | null {
  const normalized = normalizeModelProvider(provider)

  if (normalized.includes('openai') || normalized === 'open-ai') return 'openai'
  if (normalized.includes('google') || normalized.includes('gemini') || normalized.includes('vertex')) {
    return 'google'
  }
  if (
    normalized.includes('bytedance') ||
    normalized.includes('byte-dance') ||
    normalized.includes('doubao') ||
    normalized.includes('seedream')
  ) {
    return 'bytedance'
  }
  if (
    normalized.includes('xai') ||
    normalized === 'x-ai' ||
    normalized.includes('grok') ||
    normalized === 'x'
  ) {
    return 'xai'
  }

  return null
}

const PROVIDER_ICONS: Record<ModelProviderId, ComponentType<ProviderIconProps>> = {
  openai: OpenAIIcon,
  google: GoogleIcon,
  bytedance: ByteDanceIcon,
  xai: XaiIcon,
}

export type ModelProviderIconProps = ProviderIconProps & {
  provider: string
}

export function ModelProviderIcon({ provider, className, size = 12, ...props }: ModelProviderIconProps) {
  const providerId = resolveModelProviderId(provider)
  const slug = normalizeModelProvider(provider)
  const dimension = typeof size === 'number' ? size : 12

  if (!providerId) {
    return (
      <ModelSelectorLogo
        className={cn('dark:invert', className)}
        height={dimension}
        provider={slug}
        width={dimension}
      />
    )
  }

  const Icon = PROVIDER_ICONS[providerId]
  return <Icon aria-label={`${provider} logo`} className={className} size={size} {...props} />
}
