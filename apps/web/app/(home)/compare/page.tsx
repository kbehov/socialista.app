import { CompareHub } from '@/components/landing/compare-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Compare Socialista with Arcads, MakeUGC, Buffer, and more',
  },
  description:
    'How Socialista compares with Arcads, MakeUGC, Buffer, Superscale, HeyGen, and Creatify. Features and published prices, checked October 2, 2026.',
  alternates: {
    canonical: '/compare',
  },
}

export default function ComparePage() {
  return <CompareHub />
}
