import { INDUSTRIES, INDUSTRIES_PAGE, industryPath } from '@/components/landing/industries'
import { IndustriesHub } from '@/components/landing/industries-page'
import { createMetadata } from '@/lib/seo/base'
import { itemListJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

const title = INDUSTRIES_PAGE.metaTitle
const description = INDUSTRIES_PAGE.metaDescription

export const metadata = createMetadata({
  title,
  description,
  path: '/industries',
})

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path: '/industries' }),
          itemListJsonLd({
            name: 'Socialista industries',
            path: '/industries',
            items: INDUSTRIES.map(industry => ({ name: industry.name, path: industryPath(industry.slug) })),
          }),
        ]}
      />
      <IndustriesHub />
    </>
  )
}
