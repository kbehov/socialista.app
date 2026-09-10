import styles from '../landing.module.css'
import { ProductMockup } from './product-mockup'
import { STUDIO_MOCKUP_NAV } from './studio-nav'

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>Slides</p>
        <p className="mt-1.5 text-xs font-medium">5 · Square</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Typography</p>
        <p className="mt-1.5 text-xs font-medium">Geist · Tight</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Theme</p>
        <p className="mt-1.5 text-xs font-medium">Monochrome</p>
      </div>
    </>
  )
}

export function MockupSlideshows() {
  return (
    <ProductMockup
      active="slideshows"
      navItems={STUDIO_MOCKUP_NAV}
      title="Slideshow editor"
      inspector={<Inspector />}
    >
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`${styles.mockupCard} w-[28%] shrink-0`}>
            <div
              className={i % 2 === 0 ? styles.mockupSwatch : styles.mockupSwatchAlt}
              style={{ aspectRatio: '1' }}
            />
            <div className="space-y-1 p-2">
              <div className="h-1.5 w-full rounded bg-border" />
              <div className="h-1.5 w-2/3 rounded bg-border/60" />
              <p className="pt-1 text-[0.5rem] text-muted-foreground">Slide {i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </ProductMockup>
  )
}
