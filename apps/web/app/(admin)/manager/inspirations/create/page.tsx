import { PageHeader } from '@/components/common/page-header'
import { InspirationCreateWrapper } from '../_components/inspiration-create'

export default function CreateInspirationPage() {
  return (
    <>
      <PageHeader
        title="Create inspiration"
        description="Import a TikTok post."
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Inspirations', href: '/manager/inspirations' },
          { label: 'Create' },
        ]}
        backHref="/manager/inspirations"
      />

      <InspirationCreateWrapper />
    </>
  )
}
