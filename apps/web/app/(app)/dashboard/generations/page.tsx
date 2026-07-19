import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { GenerationsView } from '@/components/generations/generations-view'
import { PageHeader } from '@/components/headers/page-header'
import { WorkspaceRequired } from '../_components/workspace-required'
import {
  getWorkspaceGenerations,
  type GetWorkspaceGenerationsQuery,
} from '@/services/generation.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { GenerationKind, GenerationStatus, MetaResponse } from '@socialista/types'
import { SparklesIcon } from 'lucide-react'
import { Suspense } from 'react'

type GenerationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const DEFAULT_LIMIT = 20

const KIND_VALUES = new Set<GenerationKind>(['image', 'static-ad', 'video'])
const STATUS_VALUES = new Set<GenerationStatus>(['running', 'completed', 'failed'])

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_LIMIT,
  hasNextPage: false,
  hasPreviousPage: false,
}

function toSearchParamsRecord(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      params.set(key, value)
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','))
    }
  }

  return params
}

function parseKind(value: string | null): GenerationKind | undefined {
  if (value && KIND_VALUES.has(value as GenerationKind)) {
    return value as GenerationKind
  }
  return undefined
}

function parseStatus(value: string | null): GenerationStatus | undefined {
  if (value && STATUS_VALUES.has(value as GenerationStatus)) {
    return value as GenerationStatus
  }
  return undefined
}

function getGenerationsListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): GetWorkspaceGenerationsQuery {
  const params = toSearchParamsRecord(searchParams)

  const page = Number.parseInt(params.get('page') ?? '1', 10)
  const limit = Number.parseInt(params.get('limit') ?? String(DEFAULT_LIMIT), 10)

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
    sort: params.get('sort') ?? undefined,
    kind: parseKind(params.get('kind')),
    status: parseStatus(params.get('status')),
  }
}

export default async function GenerationsPage({ searchParams }: GenerationsPageProps) {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view generation history." />
  }

  const params = await searchParams
  const query = getGenerationsListQuery(params)
  const response = await getWorkspaceGenerations(workspace.id, query)

  const generations = response.data?.generations ?? []
  const meta = response.data?.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Generations"
        description={`${formatItemCount(meta.total)} in ${workspace.name}`}
      />

      {!response.success ? (
        <ErrorState
          title={response.message ?? 'Failed to load generations'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : generations.length === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          title="No generations yet"
          description="Create images or static ads in the studio. Finished runs will show up here with cost, runtime, and results."
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/60 bg-gradient-to-b from-muted/30 to-muted/10"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/60 [&_svg]:size-5"
        />
      ) : (
        <Suspense fallback={null}>
          <GenerationsView generations={generations} meta={meta} />
        </Suspense>
      )}
    </div>
  )
}
