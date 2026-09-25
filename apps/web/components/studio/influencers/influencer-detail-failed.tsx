import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import Link from 'next/link'

type InfluencerDetailFailedProps = {
  error?: string | null
}

export function InfluencerDetailFailed({ error }: InfluencerDetailFailedProps) {
  return (
    <div className="rounded-2xl bg-destructive/5 px-6 py-8 ring-1 ring-destructive/20">
      <p className="font-medium text-destructive">Generation failed</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {error ?? 'Something went wrong. Try creating again.'}
      </p>
      <Button asChild variant="outline" className="mt-4 rounded-xl">
        <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}>Create another</Link>
      </Button>
    </div>
  )
}
