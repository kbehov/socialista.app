import styles from '@/app/(home)/_components/landing/landing.module.css'
import { ProductMockup } from '@/app/(home)/_components/landing/product-mockup'

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>Duration</p>
        <p className="mt-1.5 text-xs font-medium">0:18 · 9:16</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Tracks</p>
        <p className="mt-1.5 text-xs font-medium">Video · Audio · Text</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Export</p>
        <p className="mt-1.5 text-xs font-medium">MP4 · 1080p</p>
      </div>
    </>
  )
}

export function MockupVideo() {
  return (
    <ProductMockup active="video" title="Video editor" inspector={<Inspector />}>
      <div className="flex gap-3">
        <div className={`${styles.mockupSwatchAlt} w-[38%] shrink-0 aspect-[9/16] rounded-md border border-border`} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-medium text-muted-foreground">Timeline</p>
          <div className={styles.mockupTimeline}>
            <div className={styles.mockupTrack}>
              <div className={styles.mockupTrackFill} style={{ left: '8%', width: '72%' }} />
            </div>
            <div className={styles.mockupTrack}>
              <div className={styles.mockupTrackFill} style={{ left: '0%', width: '100%', opacity: 0.5 }} />
            </div>
            <div className={styles.mockupTrack}>
              <div className={styles.mockupTrackFill} style={{ left: '22%', width: '40%' }} />
            </div>
          </div>
          <div className="mt-3 flex gap-1">
            {['Trim', 'Text', 'Export'].map(action => (
              <span
                key={action}
                className="rounded-md border border-border px-1.5 py-0.5 text-[0.5625rem] font-medium text-muted-foreground"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ProductMockup>
  )
}
