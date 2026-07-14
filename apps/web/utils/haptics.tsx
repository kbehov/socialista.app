export type CommitHapticProps = {
  vibrateDuration?: number
}
export function commitHaptic({ vibrateDuration = 10 }: CommitHapticProps) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(vibrateDuration)
  }
}
