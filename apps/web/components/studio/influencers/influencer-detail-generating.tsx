import { LoaderCircleIcon } from 'lucide-react'

type InfluencerDetailGeneratingProps = {
  name: string
}

export function InfluencerDetailGenerating({ name }: InfluencerDetailGeneratingProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/20 px-6 py-20 ring-1 ring-border/40">
      <LoaderCircleIcon className="size-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
      <p className="mt-4 text-[15px] font-medium tracking-[-0.02em]">Generating identity anchors…</p>
      <p className="mt-1 max-w-sm text-center text-[13px] text-muted-foreground">
        Creating consistent portraits for {name}. This usually takes a minute.
      </p>
    </div>
  )
}
