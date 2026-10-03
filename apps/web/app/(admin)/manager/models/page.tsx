import { getAiCompanies } from '@/services/ai-company.service'
import { getModels } from '@/services/models.service'
import type { MetaResponse } from '@socialista/types'

import { ModelsPageClient } from './_components/models-page-client'

const MODELS_PAGE_SIZE = 100

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: MODELS_PAGE_SIZE,
  hasNextPage: false,
  hasPreviousPage: false,
}

type ModelsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string') return 1
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const params = await searchParams
  const page = parsePage(params.page)

  const [modelsResult, companiesResult] = await Promise.all([
    getModels(`page=${page}&limit=${MODELS_PAGE_SIZE}&sort=name`),
    getAiCompanies('limit=100&sort=name'),
  ])
  const models = modelsResult.data?.models ?? []
  const companies = companiesResult.data?.companies ?? []
  const meta = modelsResult.meta ?? { ...defaultMeta, page }

  return <ModelsPageClient models={models} companies={companies} meta={meta} />
}
