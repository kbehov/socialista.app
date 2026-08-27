import { ErrorState } from '@/components/common/error-state'
import { GenerationsView } from '@/components/generations/generations-view'
import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getWorkspaceGenerations, type GetWorkspaceGenerationsQuery } from '@/services/generation.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import type { GenerationKind, GenerationStatus, MetaResponse } from '@socialista/types'
import Link from 'next/link'
import { Suspense } from 'react'
import { WorkspaceRequired } from '../../../../components/dashboard/workspace-required'

type GenerationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const DEFAULT_LIMIT = 20

const KIND_VALUES = new Set<GenerationKind>(['image', 'static-ad', 'video', 'slideshow'])
const STATUS_VALUES = new Set<GenerationStatus>(['running', 'completed', 'failed'])

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_LIMIT,
  hasNextPage: false,
  hasPreviousPage: false,
}

function toSearchParamsRecord(searchParams: Record<string, string | string[] | undefined>): URLSearchParams {
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
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view generation history." />
  }

  const params = await searchParams
  const query = getGenerationsListQuery(params)
  const response = await getWorkspaceGenerations(workspace.id, {
    ...query,
    projectId: project?.id,
  })

  const generations = response.data?.generations ?? []
  const meta = response.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Generations"
        description={`${meta.total} ${meta.total === 1 ? 'generation' : 'generations'} in ${workspace.name}`}
      />

      {!response.success ? (
        <ErrorState
          title={response.message ?? 'Failed to load generations'}
          description="Refresh the page to try again."
          className="flex-1"
        />
      ) : generations.length === 0 ? (
        <section className="flex min-h-0 flex-1 flex-col justify-center py-10 sm:py-14">
          <h2 className="text-lg font-medium tracking-[-0.02em] text-foreground">
            No generations yet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/64">
            Create images or static ads in the studio. Finished runs will show up here with
            cost, runtime, and results.
          </p>
          <div className="mt-6">
            <Button size="sm" className="rounded-md px-3.5 font-medium" asChild>
              <Link href={DASHBOARD_ROUTES.STUDIO.IMAGES}>Open studio</Link>
            </Button>
          </div>
        </section>
      ) : (
        <Suspense fallback={null}>
          <GenerationsView generations={generations} meta={meta} />
        </Suspense>
      )}
    </div>
  )
}
