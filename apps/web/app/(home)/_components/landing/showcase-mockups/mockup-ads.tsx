import styles from '@/app/(home)/_components/landing/landing.module.css'
import { ProductMockup } from '@/app/(home)/_components/landing/product-mockup'

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>Product</p>
        <p className="mt-1.5 text-xs font-medium">Ceramic mug · $28</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Style</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {['Clean', 'Bold', 'Sale'].map(style => (
            <span
              key={style}
              className="rounded-md border border-border px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground"
            >
              {style}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className={styles.eyebrow}>CTA</p>
        <p className="mt-1.5 text-xs font-medium">Shop now</p>
      </div>
    </>
  )
}

export function MockupAds() {
  return (
    <ProductMockup active="ads" title="Static ads" inspector={<Inspector />}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div key={i} className={styles.mockupCard}>
            <div
              className={
                i === 0 ? styles.mockupSwatch : i === 1 ? styles.mockupSwatchAlt : styles.mockupSwatchWarm
              }
              style={{ aspectRatio: '1' }}
            />
            <div className="space-y-1 p-2">
              <div className="h-1.5 w-3/4 rounded bg-border" />
              <div className="h-1.5 w-1/2 rounded bg-border/70" />
              <div className="mt-2 inline-flex rounded bg-foreground px-1.5 py-0.5 text-[0.5rem] font-medium text-background">
                Shop
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProductMockup>
  )
}
