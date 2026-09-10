import { Iphone } from '@/components/ui/iphone'

import styles from '../landing.module.css'
import { ProductMockup } from './product-mockup'
import { STUDIO_MOCKUP_NAV } from './studio-nav'

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>Script</p>
        <p className="mt-1.5 text-xs font-medium">Hook · Demo · CTA</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Talent</p>
        <p className="mt-1.5 text-xs font-medium">Maya · Product in hand</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Format</p>
        <p className="mt-1.5 text-xs font-medium">9:16 · 15s</p>
      </div>
    </>
  )
}

export function MockupUgc() {
  return (
    <ProductMockup active="ugc" navItems={STUDIO_MOCKUP_NAV} title="UGC ads" inspector={<Inspector />}>
      <div className="flex items-center justify-center gap-4">
        <div className="w-[42%] max-w-[9rem] shrink-0">
          <Iphone src="/socialista-video.webp" className="shadow-lg" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[0.625rem] font-medium text-muted-foreground">Scene stills</p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className={`${styles.mockupSwatch} aspect-[4/5] rounded-md`} />
            <div className={`${styles.mockupSwatchAlt} aspect-[4/5] rounded-md`} />
          </div>
          <div className={styles.mockupPrompt}>
            <span className="truncate text-[0.625rem]">“This changed my morning routine…”</span>
          </div>
        </div>
      </div>
    </ProductMockup>
  )
}
