import {
  COMPARE_COMPETITORS,
  COMPARE_HUB,
  comparePath,
} from '@/components/landing/compare'
import { CompareHub } from '@/components/landing/compare-page'
import { createMetadata } from '@/lib/seo/base'
import { faqPageJsonLd, itemListJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

const title = 'Socialista vs Arcads, MakeUGC, Buffer, and 5 more'
const description =
  'Which tool does the next job: talking UGC, a scheduler, or paid-social research. Socialista compared with Arcads, MakeUGC, Buffer, Superscale, HeyGen, Creatify, Predis.ai, and AdCreative.ai. Checked October 2, 2026.'

export const metadata = createMetadata({
  title,
  description,
  path: '/compare',
  keywords: [
    'Socialista vs Arcads',
    'Socialista vs MakeUGC',
    'Socialista vs Buffer',
    'AI UGC ads comparison',
    'social media studio vs scheduler',
  ],
})

export default function ComparePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path: '/compare' }),
          itemListJsonLd({
            name: title,
            path: '/compare',
            items: COMPARE_COMPETITORS.map(competitor => ({
              name: `Socialista vs ${competitor.name}`,
              path: comparePath(competitor.slug),
            })),
          }),
          faqPageJsonLd(COMPARE_HUB.faqs, '/compare'),
        ]}
      />
      <CompareHub />
    </>
  )
}
