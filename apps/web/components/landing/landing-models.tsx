import { ModelLogo } from '@/components/icons/model-logo'
import { getModelTypeLandingCategory } from '@/lib/model-type'
import { cn } from '@/lib/utils'
import { getLandingModels } from '@/services/models.service'
import type { LandingModel } from '@socialista/types'

import { MODELS_SECTION } from './content'
import { FadeIn } from './fade-in'
import { landingSupportingContentGap, landingSupportingSectionY, landingSupportingTitle } from './landing-classes'
import { Section } from './section'

async function loadLandingModels(): Promise<{ models: LandingModel[]; total: number }> {
  try {
    const response = await getLandingModels()
    if (!response.success || !response.data) {
      return { models: [], total: 0 }
    }
    return { models: response.data.models, total: response.data.total }
  } catch {
    return { models: [], total: 0 }
  }
}

function formatModelsCount(count: number) {
  if (count >= MODELS_SECTION.countThreshold) {
    return `${MODELS_SECTION.countThreshold}+`
  }
  return String(count)
}

function LandingModelRow({ model }: { model: LandingModel }) {
  return (
    <li className="flex min-w-0 items-start gap-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-[0.5rem]',
          'bg-[color-mix(in_srgb,var(--landing-ink)_4%,transparent)]',
        )}
      >
        <ModelLogo model={model} size={20} className="size-5" />
      </span>
      <div className="min-w-0 pt-px">
        <p className="truncate text-[0.875rem] font-medium leading-[1.25] tracking-[-0.02em] text-[var(--landing-ink)]">
          {model.name}
        </p>
        <p className="mt-1 truncate text-[0.8125rem] leading-[1.3] text-[var(--landing-muted)]">
          {getModelTypeLandingCategory(model.modelType)}
        </p>
      </div>
    </li>
  )
}

export async function LandingModels() {
  const { models, total } = await loadLandingModels()
  if (models.length === 0) return null

  const countLabel = formatModelsCount(total)

  return (
    <Section
      id="ai-models"
      landingDivider
      alt
      className={landingSupportingSectionY}
      containerClassName="max-w-5xl"
    >
      <FadeIn>
        <h2 id="ai-models-heading" className={cn(landingSupportingTitle, 'font-semibold')}>
          {MODELS_SECTION.titleLead} {countLabel} {MODELS_SECTION.titleRest}
        </h2>
      </FadeIn>

      <FadeIn delay={0.05} className={cn(landingSupportingContentGap)}>
        <ul
          className={cn(
            'grid grid-cols-2 gap-x-5 gap-y-6',
            'sm:grid-cols-3 sm:gap-x-6 sm:gap-y-7',
            'md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-8',
          )}
          aria-label="AI models available in Socialista"
        >
          {models.map(model => (
            <LandingModelRow key={model._id} model={model} />
          ))}
        </ul>
      </FadeIn>
    </Section>
  )
}
