import { ModelSelectorLogo } from '@/components/ai-elements/model-selector'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { cn } from '@/lib/utils'
import type { Model } from '@socialista/types'

type ModelLogoProps = {
  model: Model
  className?: string
  size?: number
}

export function ModelLogo({ model, className, size = 14 }: ModelLogoProps) {
  if (model.company?.logo) {
    return (
      <ModelSelectorLogo
        alt={`${model.company.name} logo`}
        className={cn('object-contain', className)}
        height={size}
        src={model.company.logo}
        width={size}
      />
    )
  }

  return <ModelProviderIcon className={className} provider={model.modelProvider} size={size} />
}
