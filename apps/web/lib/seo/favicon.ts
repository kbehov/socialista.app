import type { Metadata } from 'next'

/** Icons metadata for the existing `app/favicon.ico`. Consumed by `createMetadata`. */
export const iconsMetadata = {
  icon: [{ url: '/favicon.ico', sizes: 'any' }],
  shortcut: '/favicon.ico',
} satisfies Metadata['icons']
