import { ChartColumnIcon, HistoryIcon, SparklesIcon } from 'lucide-react'

import { landingEyebrow, landingMockupCard } from '../landing-classes'
import { ProductMockup, type MockupNavItem } from './product-mockup'

const WORKSPACE_NAV: MockupNavItem[] = [
  { id: 'analytics', label: 'Analytics', icon: ChartColumnIcon },
  { id: 'generations', label: 'Generations', icon: HistoryIcon },
  { id: 'context', label: 'Context', icon: SparklesIcon },
]

function Inspector() {
  return (
    <>
      <div>
        <p className={landingEyebrow}>Range</p>
        <p className="mt-1.5 text-xs font-medium">Last 30 days</p>
      </div>
      <div>
        <p className={landingEyebrow}>Top channel</p>
        <p className="mt-1.5 text-xs font-medium">Instagram</p>
      </div>
      <div>
        <p className={landingEyebrow}>Published</p>
        <p className="mt-1.5 text-xs font-medium">24 posts</p>
      </div>
    </>
  )
}

export function MockupAnalytics() {
  return (
    <ProductMockup active="analytics" navItems={WORKSPACE_NAV} title="Analytics" actionLabel="Open" inspector={<Inspector />}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Reach', value: '128K' },
            { label: 'Posts', value: '24' },
            { label: 'Accounts', value: '5' },
          ].map(stat => (
            <div key={stat.label} className={`${landingMockupCard} p-2.5`}>
              <p className="text-[0.5625rem] text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className={landingMockupCard}>
          <div className="flex h-20 items-end gap-1 p-2.5">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-foreground/10"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          {['Summer launch carousel', 'UGC hook v2', 'Static ad — mug'].map((run, i) => (
            <div key={run} className="flex items-center justify-between rounded-md border border-border px-2 py-1.5">
              <span className="truncate text-[0.625rem] font-medium">{run}</span>
              <span className="text-[0.5625rem] text-muted-foreground">{i === 0 ? '2h ago' : '1d ago'}</span>
            </div>
          ))}
        </div>
      </div>
    </ProductMockup>
  )
}
