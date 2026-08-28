import { getAiCompanies } from '@/services/ai-company.service'

import { AiCompaniesPageClient } from './_components/ai-companies-page-client'

export default async function AiCompaniesPage() {
  const result = await getAiCompanies('limit=100&sort=name')
  const companies = result.data?.companies ?? []

  return <AiCompaniesPageClient companies={companies} />
}
