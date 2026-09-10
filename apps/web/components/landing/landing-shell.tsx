import type { ReactNode } from 'react'

import styles from './landing.module.css'

type LandingShellProps = {
  children: ReactNode
}

export function LandingShell({ children }: LandingShellProps) {
  return <div className={styles.shell}>{children}</div>
}
