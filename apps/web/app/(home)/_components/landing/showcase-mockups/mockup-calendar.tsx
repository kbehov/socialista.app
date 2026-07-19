import styles from '@/app/(home)/_components/landing/landing.module.css'
import { ProductMockup } from '@/app/(home)/_components/landing/product-mockup'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const EVENTS: Record<number, string[]> = {
  1: ['Reel'],
  2: ['Carousel'],
  4: ['Ad · Meta'],
  5: ['Story'],
}

function Inspector() {
  return (
    <>
      <div>
        <p className={styles.eyebrow}>This week</p>
        <p className="mt-1.5 text-xs font-medium">4 posts queued</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Channels</p>
        <p className="mt-1.5 text-xs font-medium">IG · TikTok · LinkedIn</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Next</p>
        <p className="mt-1.5 text-xs font-medium">Tue · 9:00 AM</p>
      </div>
    </>
  )
}

export function MockupCalendar() {
  return (
    <ProductMockup active="schedule" title="Content calendar" inspector={<Inspector />}>
      <div className={styles.mockupCalendar}>
        {DAYS.map((day, i) => (
          <div key={day} className={styles.mockupCalCell}>
            <span>{day}</span>
            {EVENTS[i]?.map(event => (
              <div key={event} className={styles.mockupCalEvent}>
                {event}
              </div>
            ))}
          </div>
        ))}
      </div>
    </ProductMockup>
  )
}
