import type { AppContext } from '@/middlewares/auth.middleware.js'
import { withQueryParam, parseParamId } from '@/utils/common.utils.js'
import { getGenerationForMember, serializeGeneration } from '@/utils/generation.utils.js'
import { successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import { getGenerations, type IGeneration } from '@socialista/db'
import type { Context } from 'hono'

export const getWorkspaceGenerations = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getGenerations(withQueryParam(c.req.url, 'workspace', workspaceId))
  return successResponse(
    c,
    200,
    {
      generations: data.generations.map(generation =>
        serializeGeneration(generation as IGeneration),
      ),
    },
    data.meta,
  )
}

export const getGeneration = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'generation ID')
  const generation = await getGenerationForMember(id, userId)
  return successResponse(c, 200, { generation: serializeGeneration(generation) })
}
