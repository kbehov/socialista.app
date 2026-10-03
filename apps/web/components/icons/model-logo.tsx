import { ModelSelectorLogo } from '@/components/ai-elements/model-selector'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { cn } from '@/lib/utils'
import type { LandingModel, Model } from '@socialista/types'

type ModelLogoProps = {
  model: Pick<Model, 'value' | 'modelProvider' | 'company'> | LandingModel
  className?: string
  size?: number
}

export function ModelLogo({ model, className, size = 14 }: ModelLogoProps) {
  const provider = model.value.toLowerCase().includes('omnihuman')
    ? 'bytedance'
    : model.modelProvider
  const icon = model.company?.logo ? (
    <ModelSelectorLogo
      alt={`${model.company.name} logo`}
      className="size-full object-contain"
      height={size}
      src={model.company.logo}
      width={size}
    />
  ) : (
    <ModelProviderIcon className="size-full" provider={provider} size={size} />
  )

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {icon}
    </span>
  )
}
