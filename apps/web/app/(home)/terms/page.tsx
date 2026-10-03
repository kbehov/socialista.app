import { LegalDocument } from '@/components/landing/legal-document'
import { TERMS_OF_SERVICE_DOCUMENT } from '@/components/landing/terms-of-service-content'
import { createMetadata } from '@/lib/seo/base'
import { breadcrumbJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

const title = 'Terms of Service — Socialista'
const description = TERMS_OF_SERVICE_DOCUMENT.description

export const metadata = createMetadata({
  title,
  description,
  path: '/terms',
  keywords: [
    'Socialista terms of service',
    'terms of use',
    'user agreement',
    'AI content terms',
    'social media publishing terms',
  ],
})

export default function TermsOfServicePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path: '/terms' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Terms of Service', path: '/terms' },
          ]),
        ]}
      />
      <LegalDocument meta={TERMS_OF_SERVICE_DOCUMENT} />
    </>
  )
}
