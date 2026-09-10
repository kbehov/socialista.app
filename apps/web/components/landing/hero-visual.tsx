import Image from 'next/image'

import styles from './landing.module.css'
import { FadeIn } from './fade-in'

export function HeroVisual() {
  return (
    <FadeIn delay={0.28} immediate className={`${styles.mockupHeroWrap} mt-14 sm:mt-20`}>
      <div className={styles.heroVisual}>
        <div className={`${styles.heroVisualFrame} ${styles.heroVisualMain}`}>
          <Image
            src="/socialista-image.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
            priority
          />
        </div>
        <div className={`${styles.heroVisualFrame} ${styles.heroVisualSecondary}`}>
          <Image
            src="/socialista-static-ads.webp"
            alt=""
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
        </div>
        <div className={`${styles.heroVisualFrame} ${styles.heroVisualTertiary}`}>
          <Image
            src="/socialista-video.webp"
            alt=""
            fill
            sizes="240px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </FadeIn>
  )
}
