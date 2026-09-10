import { ChartColumnIcon, HistoryIcon, SparklesIcon } from 'lucide-react'

import styles from '../landing.module.css'
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
        <p className={styles.eyebrow}>Brand</p>
        <p className="mt-1.5 text-xs font-medium">Acme Co.</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Products</p>
        <p className="mt-1.5 text-xs font-medium">12 in catalog</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Skills</p>
        <p className="mt-1.5 text-xs font-medium">3 active</p>
      </div>
    </>
  )
}

export function MockupContext() {
  return (
    <ProductMockup active="context" navItems={WORKSPACE_NAV} title="Context & skills" inspector={<Inspector />}>
      <div className="space-y-2">
        {[
          { title: 'Brand voice', desc: 'Direct, warm, no jargon' },
          { title: 'Product catalog', desc: 'Mug · $28 · Ceramic' },
          { title: 'UGC script skill', desc: 'Hook in 3s, CTA at end' },
        ].map(item => (
          <div key={item.title} className={`${styles.mockupCard} p-2.5`}>
            <p className="text-[0.6875rem] font-medium">{item.title}</p>
            <p className="mt-0.5 text-[0.625rem] text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </ProductMockup>
  )
}
