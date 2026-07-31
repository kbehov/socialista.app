'use client'

import type { Model, Product } from '@socialista/types'
import { StaticAdExamples } from './static-ad-examples'
import { StaticAdPromptInput } from './static-ad-prompt-input'
import { StaticAdStudioProvider } from './static-ad-studio-provider'

type StaticAdStudioWorkspaceProps = {
  products: Product[]
  workspaceId: string
  model: Model | null
  productsTruncated?: boolean
}

function StaticAdStudioHero() {
  return (
    <header className="space-y-1.5">
      <h1 className="text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2rem]">
        Static ads
      </h1>
      <p className="max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
        Drop in a product photo. Add a brief if you want — or let us invent the creative.
      </p>
    </header>
  )
}

export function StaticAdStudioWorkspace({
  products,
  workspaceId,
  model,
  productsTruncated = false,
}: StaticAdStudioWorkspaceProps) {
  return (
    <StaticAdStudioProvider>
      <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div
          aria-hidden
          className="pointer-events-none sticky top-0 z-10 h-8 bg-linear-to-b from-background via-background/80 to-transparent motion-reduce:hidden"
        />

        <div className="flex flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-8">
            <StaticAdStudioHero />
            <StaticAdPromptInput
              model={model}
              products={products}
              productsTruncated={productsTruncated}
              workspaceId={workspaceId}
            />
          </div>

          <div className="mx-auto mt-14 w-full max-w-5xl border-t border-border/50 pt-12 sm:mt-16 sm:pt-14">
            <StaticAdExamples />
          </div>
        </div>
      </div>
    </StaticAdStudioProvider>
  )
}
