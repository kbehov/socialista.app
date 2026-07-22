import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE } from '@/config/api.config.js'
import { uploadBufferToR2 } from '@/lib/aws.js'
import { parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceStorageAvailable, getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createWorkspaceImageFile,
  incrementWorkspaceStorageUsage,
} from '@socialista/db'
import type { Context } from 'hono'
import sharp from 'sharp'

async function processGeneratedImage(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type) || !file.type.startsWith('image/')) {
    throw new HttpError(400, 'Invalid image type')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(400, 'File size exceeds the maximum size')
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const sharpInstance = sharp(rawBuffer)
  const { width, height } = await sharpInstance.metadata()

  if (!width || !height) {
    throw new HttpError(400, 'Could not read image dimensions')
  }

  const webpBuffer = await sharpInstance.webp({ quality: 85 }).toBuffer()

  return { buffer: webpBuffer, mimeType: 'image/webp', ext: 'webp', width, height }
}

export const uploadGeneratedImage = async (c: Context) => {
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

  const workspace = await getWorkspaceAsMember(workspaceId, userId)

  const { buffer, mimeType, ext, width, height } = await processGeneratedImage(file)
  assertWorkspaceStorageAvailable(workspace, buffer.length)

  const key = `workspaces/${workspaceId}/generated/${crypto.randomUUID()}.${ext}`
  const url = await uploadBufferToR2(key, buffer, mimeType)

  const image = await createWorkspaceImageFile({
    workspaceId,
    userId,
    url,
    key,
    width,
    height,
    size: buffer.length,
  })

  await incrementWorkspaceStorageUsage(workspaceId, buffer.length)

  return successResponse(c, 201, image)
}
