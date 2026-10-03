import { LegalDocument } from '@/components/landing/legal-document'
import { PRIVACY_POLICY_DOCUMENT } from '@/components/landing/privacy-policy-content'
import { createMetadata } from '@/lib/seo/base'
import { breadcrumbJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

const title = 'Privacy Policy — Socialista'
const description = PRIVACY_POLICY_DOCUMENT.description

export const metadata = createMetadata({
  title,
  description,
  path: '/privacy',
  keywords: [
    'Socialista privacy policy',
    'data protection',
    'GDPR',
    'CCPA',
    'AI content privacy',
    'social media scheduler privacy',
  ],
})

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: title,
            description,
            path: '/privacy',
            dateModified: PRIVACY_POLICY_DOCUMENT.lastUpdatedIso,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Privacy Policy', path: '/privacy' },
          ]),
        ]}
      />
      <LegalDocument meta={PRIVACY_POLICY_DOCUMENT} />
    </>
  )
}
