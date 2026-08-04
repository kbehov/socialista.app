import { getModels } from '@/services/models.service'

import { ModelsPageClient } from './_components/models-page-client'

export default async function ModelsPage() {
  const result = await getModels('limit=100&sort=name')
  console.log('result', result.data?.models)
  const models = result.data?.models ?? []

  return <ModelsPageClient models={models} />
}
