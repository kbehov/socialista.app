import { ALLOWED_MIME_TYPES, MAX_GENERATED_VIDEO_SIZE } from '@/config/api.config.js'
import { uploadBufferToR2 } from '@/lib/aws.js'
import { parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceStorageAvailable, getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import { createWorkspaceImageFile, incrementWorkspaceStorageUsage } from '@socialista/db'
import type { Context } from 'hono'

function extensionForVideoMime(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm'
  if (mimeType.includes('ogg')) return 'ogv'
  return 'mp4'
}

export const uploadGeneratedVideo = async (c: Context) => {
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  const formData = await c.req.formData()
  const file = formData.get('file')
  const userId = formData.get('userId')

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }

  if (typeof userId !== 'string' || !userId.trim()) {
    throw new HttpError(400, 'User ID is required')
  }

  const mimeType = file.type && ALLOWED_MIME_TYPES.has(file.type) ? file.type : 'video/mp4'
  if (!mimeType.startsWith('video/')) {
    throw new HttpError(400, 'Invalid video type')
  }

  if (file.size > MAX_GENERATED_VIDEO_SIZE) {
    throw new HttpError(400, 'File size exceeds the maximum size')
  }

  const workspace = await getWorkspaceAsMember(workspaceId, userId)
  const buffer = Buffer.from(await file.arrayBuffer())
  assertWorkspaceStorageAvailable(workspace, buffer.length)

  const ext = extensionForVideoMime(mimeType)
  const key = `workspaces/${workspaceId}/${crypto.randomUUID()}.${ext}`
  const url = await uploadBufferToR2(key, buffer, mimeType)

  const image = await createWorkspaceImageFile({
    workspaceId,
    userId,
    url,
    key,
    width: 0,
    height: 0,
    size: buffer.length,
  })

  await incrementWorkspaceStorageUsage(workspaceId, buffer.length)

  return successResponse(c, 201, image)
}
