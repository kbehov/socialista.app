import styles from '../landing.module.css'
import { ProductMockup } from './product-mockup'
import { STUDIO_MOCKUP_NAV } from './studio-nav'

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>Talent</p>
        <p className="mt-1.5 text-xs font-medium">Maya · Brand clone</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Used in</p>
        <p className="mt-1.5 text-xs font-medium">Stills · UGC · Ads</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Status</p>
        <p className="mt-1.5 text-xs font-medium">Ready</p>
      </div>
    </>
  )
}

export function MockupInfluencers() {
  return (
    <ProductMockup
      active="influencers"
      navItems={STUDIO_MOCKUP_NAV}
      title="Influencers"
      inspector={<Inspector />}
    >
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={cnSwatch(i)}
              style={{ width: '100%', aspectRatio: '1', borderRadius: '999px' }}
            />
            <div className="h-1 w-2/3 rounded bg-border/70" />
          </div>
        ))}
      </div>
    </ProductMockup>
  )
}

function cnSwatch(i: number) {
  if (i % 3 === 0) return styles.mockupSwatch
  if (i % 3 === 1) return styles.mockupSwatchAlt
  return styles.mockupSwatchWarm
}
