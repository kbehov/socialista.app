import { ABOUT_PAGE } from '@/components/landing/about-content'
import { AboutPage } from '@/components/landing/about-page'
import { createMetadata } from '@/lib/seo/base'
import { breadcrumbJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

const title = ABOUT_PAGE.metaTitle
const description = ABOUT_PAGE.metaDescription

export const metadata = createMetadata({
  title,
  description,
  path: '/about',
  keywords: [
    'about Socialista',
    'AI UGC studio',
    'social media content studio',
    'AI creator ads',
    'social media scheduler',
  ],
})

export default function AboutRoute() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path: '/about' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      <AboutPage />
    </>
  )
}
