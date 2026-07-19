import styles from '@/app/(home)/_components/landing/landing.module.css'
import { ProductMockup } from '@/app/(home)/_components/landing/product-mockup'

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>Vibe</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {['UGC', 'Product', 'Lifestyle'].map(vibe => (
            <span
              key={vibe}
              className="rounded-md border border-border px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground"
            >
              {vibe}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className={styles.eyebrow}>Ratio</p>
        <p className="mt-1.5 text-xs font-medium">9:16 · Stories / Reels</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Model</p>
        <p className="mt-1.5 text-xs font-medium">Flux · Fast</p>
      </div>
    </>
  )
}

export function MockupImages() {
  return (
    <ProductMockup active="images" title="AI images" inspector={<Inspector />}>
      <div className={styles.mockupPrompt}>
        <span className="truncate">Soft daylight product shot, minimal desk, warm tones…</span>
      </div>
      <div className={`${styles.mockupGrid} mt-3`}>
        <div className={`${styles.mockupSwatch} aspect-[3/4]`} />
        <div className={`${styles.mockupSwatchAlt} aspect-[3/4]`} />
        <div className={`${styles.mockupSwatchWarm} aspect-[3/4]`} />
      </div>
    </ProductMockup>
  )
}
