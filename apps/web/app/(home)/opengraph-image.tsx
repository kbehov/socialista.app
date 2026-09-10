import { PAGE_METADATA } from '@/components/landing/content'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = PAGE_METADATA.title
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#000000',
          color: '#ffffff',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 32 32" fill="#000000">
              <path d="M16 2.5L18.05 11.06L21.94 10.06L20.94 13.95L29.5 16L20.94 18.05L21.94 21.94L18.05 20.94L16 29.5L13.95 20.94L10.06 21.94L11.06 18.05L2.5 16L11.06 13.95L10.06 10.06L13.95 11.06Z" />
            </svg>
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.2 }}>Socialista</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 920 }}>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            The studio that ships the post
          </div>
          <div style={{ display: 'flex', fontSize: 24, opacity: 0.65, maxWidth: 780, lineHeight: 1.4 }}>
            {PAGE_METADATA.description}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
