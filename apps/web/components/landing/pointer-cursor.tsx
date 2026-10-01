import { cn } from '@/lib/utils'

/** Decorative cursor glyph used inside dark media mockups. */
export function PointerCursor({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute z-10 size-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]',
        className,
      )}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 3.5 18 11.2c.9.55.35 1.95-.7 1.75l-4.35-.7-1.5 4.8c-.35 1.1-1.95 1.05-2.2-.1L5.5 3.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
