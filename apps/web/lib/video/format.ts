export function isVerticalReelsFormat(width: number, height: number): boolean {
  if (height <= width) return false
  return Math.abs(width / height - 9 / 16) < 0.05
}
