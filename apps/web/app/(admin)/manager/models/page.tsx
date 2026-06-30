import { getModels } from '@/services/models.service'

import { ModelsPageClient } from './_components/models-page-client'

export default async function ModelsPage() {
  const result = await getModels('limit=100&sort=name')
  const models = result.data?.models ?? []

  return <ModelsPageClient models={models} />
}
