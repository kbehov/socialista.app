type InfluencerProfileStatProps = {
  value: number
  label: string
}

export function InfluencerProfileStat({ value, label }: InfluencerProfileStatProps) {
  return (
    <div className="min-w-[4.5rem]">
      <p className="text-[15px] font-semibold tabular-nums tracking-[-0.02em]">{value}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </div>
  )
}
