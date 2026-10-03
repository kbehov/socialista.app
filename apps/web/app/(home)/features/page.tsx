import { FEATURES, FEATURES_PAGE, featurePath } from '@/components/landing/features'
import { FeaturesHub } from '@/components/landing/features-page'
import { createMetadata } from '@/lib/seo/base'
import { itemListJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

const title = FEATURES_PAGE.metaTitle
const description = FEATURES_PAGE.metaDescription

export const metadata = createMetadata({
  title,
  description,
  path: '/features',
})

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path: '/features' }),
          itemListJsonLd({
            name: 'Socialista features',
            path: '/features',
            items: FEATURES.map(feature => ({ name: feature.name, path: featurePath(feature.slug) })),
          }),
        ]}
      />
      <FeaturesHub />
    </>
  )
}
