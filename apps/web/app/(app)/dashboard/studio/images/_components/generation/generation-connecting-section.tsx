import { Shimmer } from '@/components/ai-elements/shimmer'
import { Spinner } from '@/components/ui/spinner'
import { GenerationPreviewFrame } from './generation-preview-frame'

type GenerationConnectingSectionProps = {
  headingId: string
  title: string
  isConnecting: boolean
  statusLabel: string
  aspectRatio?: string
}

export function GenerationConnectingSection({
  headingId,
  title,
  isConnecting,
  statusLabel,
  aspectRatio,
}: GenerationConnectingSectionProps) {
  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="space-y-1 text-center">
        <h2 id={headingId} className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {isConnecting ? 'Connecting' : title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isConnecting ? 'Linking to your generation…' : <Shimmer as="span">{statusLabel}</Shimmer>}
        </p>
      </div>

      <GenerationPreviewFrame aspectRatio={aspectRatio} isLoading>
        {isConnecting ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : null}
      </GenerationPreviewFrame>
    </section>
  )
}
