import { CalendarDaysIcon, Link2Icon, SendIcon } from 'lucide-react'

import styles from '../landing.module.css'
import { IMG } from '../media'
import { MediaFrame } from '../media-frame'
import { ProductMockup, type MockupNavItem } from './product-mockup'

const PUBLISH_NAV: MockupNavItem[] = [
  { id: 'accounts', label: 'Accounts', icon: Link2Icon },
  { id: 'posts', label: 'Posts', icon: SendIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
]

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
        <p className={styles.eyebrow}>Channels</p>
        <p className="mt-1.5 text-xs font-medium">IG · TikTok · LinkedIn</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Status</p>
        <p className="mt-1.5 text-xs font-medium">Scheduled · Tue 9:00</p>
      </div>
      <div>
        <p className={styles.eyebrow}>Variants</p>
        <p className="mt-1.5 text-xs font-medium">3 platforms</p>
      </div>
    </>
  )
}

export function MockupComposer() {
  return (
    <ProductMockup active="posts" navItems={PUBLISH_NAV} title="Post composer" actionLabel="Schedule" inspector={<Inspector />}>
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {['Instagram', 'TikTok', 'LinkedIn'].map((ch, i) => (
            <span
              key={ch}
              className={`rounded-md border px-2 py-0.5 text-[0.5625rem] font-medium ${
                i === 0
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {ch}
            </span>
          ))}
        </div>
        <div className={styles.mockupPrompt}>
          <span className="truncate">New drop — swipe for the full story →</span>
        </div>
        <div className="flex gap-2">
          <MediaFrame src={IMG.fashion1} className="aspect-square w-16 rounded-md" sizes="64px" />
          <MediaFrame src={IMG.watch} className="aspect-square w-16 rounded-md" sizes="64px" objectPosition="50% 50%" />
        </div>
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
      </div>
    </ProductMockup>
  )
}
