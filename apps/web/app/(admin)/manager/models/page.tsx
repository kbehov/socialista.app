import { getAiCompanies } from '@/services/ai-company.service'
import { getModels } from '@/services/models.service'

import { ModelsPageClient } from './_components/models-page-client'

export default async function ModelsPage() {
  const [modelsResult, companiesResult] = await Promise.all([
    getModels('limit=100&sort=name'),
    getAiCompanies('limit=100&sort=name'),
  ])
  const models = modelsResult.data?.models ?? []
  const companies = companiesResult.data?.companies ?? []

  return <ModelsPageClient models={models} companies={companies} />
}
