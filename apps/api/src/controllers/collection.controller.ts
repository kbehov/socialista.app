import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '@/config/api.config.js'
import { deleteObjectFromR2, getObjectSizeFromR2, uploadBufferToR2 } from '@/lib/aws.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceMember, assertWorkspaceStorageAvailable } from '@/utils/workspace.utils.js'
import {
  createImageCollection as createCollectionFromDb,
  createImage,
  decrementWorkspaceStorageUsage,
  deleteImage,
  deleteImageCollection,
  getImage,
  getImageCollection,
  getImageCollections,
  getImages,
  getImagesByCollection,
  getWorkspaceById,
  incrementCollectionImagesCount,
  incrementWorkspaceStorageUsage,
  toObjectId,
  type IImage,
} from '@socialista/db'
import type { Context } from 'hono'
import sharp from 'sharp'

export const createCollection = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = await c.req.json()
  const collection = await createCollectionFromDb({
    name: input.name,
    isPublic: input.isPublic,
    createdBy: toObjectId(userId),
    workspace: input.workspaceId ? toObjectId(input.workspaceId) : undefined,
  })
  return successResponse(c, 201, { collection })
}

export const getCollections = async (c: Context<AppContext>) => {
  const data = await getImageCollections(getQueryString(c.req.url))
  return successResponse(c, 200, data)
}

export const getCollectionById = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'collection ID')
  const collection = await getImageCollection(id)
  if (!collection) {
    throw new HttpError(404, 'Collection not found')
  }
  if (collection.createdBy.toString() !== userId && !collection.isPublic) {
    throw new HttpError(403, 'You are not authorized to access this collection')
  }
  return successResponse(c, 200, collection)
}

// GET /collections/workspace/:workspaceId/images
// Optional query: ?collection=<collectionId> to filter by collection
export const getWorkspaceImages = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')

  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) throw new HttpError(404, 'Workspace not found')
  assertWorkspaceMember(workspace, userId)

  // Inject workspace into the query so buildFilters picks it up
  const existingQuery = getQueryString(c.req.url)
  const params = new URLSearchParams(existingQuery)
  params.set('workspace', workspaceId)

  const data = await getImages(params.toString())
  return successResponse(c, 200, data)
}

type ProcessedFile = {
  buffer: Buffer
  mimeType: string
  ext: string
  width: number
  height: number
}

// Validate the file from FormData and process it:
//   - Images → converted to WebP via sharp (lossless-safe quality 85) and dimensions extracted
//   - Videos → passed through as-is with placeholder 0×0 dimensions
async function processFile(c: Context<AppContext>): Promise<ProcessedFile> {
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new HttpError(400, 'Invalid file type')
  }
  const maxSize = file.type.startsWith('image/') ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (file.size > maxSize) {
    throw new HttpError(400, 'File size exceeds the maximum size')
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())

  if (file.type.startsWith('image/')) {
    const sharpInstance = sharp(rawBuffer)
    const { width, height } = await sharpInstance.metadata()

    if (!width || !height) {
      throw new HttpError(400, 'Could not read image dimensions')
    }

    const webpBuffer = await sharpInstance
      .webp({ quality: 85 })
      .toBuffer()

    return { buffer: webpBuffer, mimeType: 'image/webp', ext: 'webp', width, height }
  }

  // Video: preserve original format, dimensions are not extracted client-side
  const ext = file.type.split('/')[1] ?? 'mp4'
  return { buffer: rawBuffer, mimeType: file.type, ext, width: 0, height: 0 }
}

async function resolveStoredFileSize(image: Pick<IImage, 'key' | 'size'>): Promise<number> {
  if (image.size && image.size > 0) {
    return image.size
  }

  return getObjectSizeFromR2(image.key)
}

async function removeStoredFile(image: Pick<IImage, '_id' | 'key' | 'size'>, workspaceId: string) {
  const size = await resolveStoredFileSize(image)

  await deleteObjectFromR2(image.key)
  await deleteImage(image._id.toString())

  if (size > 0) {
    await decrementWorkspaceStorageUsage(workspaceId, size)
  }

  return size
}

async function getWorkspaceContext(workspaceId: string, userId: string) {
  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) throw new HttpError(404, 'Workspace not found')
  assertWorkspaceMember(workspace, userId)
  return workspace
}

function assertFileInWorkspace(image: Pick<IImage, 'workspace'>, workspaceId: string) {
  if (image.workspace?.toString() !== workspaceId) {
    throw new HttpError(404, 'File not found')
  }
}

function assertFolderInWorkspace(collection: { workspace?: { toString(): string } }, workspaceId: string) {
  if (collection.workspace?.toString() !== workspaceId) {
    throw new HttpError(404, 'Folder not found')
  }
}

// POST /collections/workspace/:workspaceId/files — upload to workspace root (no collection)
export const uploadToWorkspace = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')

  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) throw new HttpError(404, 'Workspace not found')
  assertWorkspaceMember(workspace, userId)

  const { buffer, mimeType, ext, width, height } = await processFile(c)
  assertWorkspaceStorageAvailable(workspace, buffer.length)

  const key = `workspaces/${workspaceId}/${crypto.randomUUID()}.${ext}`
  const url = await uploadBufferToR2(key, buffer, mimeType)

  const image = await createImage({
    url,
    key,
    width,
    height,
    size: buffer.length,
    uploadedBy: toObjectId(userId),
    workspace: toObjectId(workspaceId),
  })

  await incrementWorkspaceStorageUsage(workspaceId, buffer.length)
  return successResponse(c, 201, image)
}

// POST /collections/workspace/:workspaceId/collection/:id/files — upload to a specific collection
export const addFileToCollection = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const collectionId = parseParamId(c.req.param('id'), 'collection ID')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')

  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) throw new HttpError(404, 'Workspace not found')
  assertWorkspaceMember(workspace, userId)

  const collection = await getImageCollection(collectionId)
  if (!collection) throw new HttpError(404, 'Collection not found')

  const { buffer, mimeType, ext, width, height } = await processFile(c)
  assertWorkspaceStorageAvailable(workspace, buffer.length)

  const key = `collections/${workspaceId}/${collection._id.toString()}/${crypto.randomUUID()}.${ext}`
  const url = await uploadBufferToR2(key, buffer, mimeType)

  const image = await createImage({
    url,
    key,
    width,
    height,
    size: buffer.length,
    collection: toObjectId(collectionId),
    uploadedBy: toObjectId(userId),
    workspace: toObjectId(workspaceId),
  })

  await incrementCollectionImagesCount(collectionId)
  await incrementWorkspaceStorageUsage(workspaceId, buffer.length)
  return successResponse(c, 201, image)
}

// DELETE /collections/workspace/:workspaceId/files/:fileId
export const deleteFile = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  const fileId = parseParamId(c.req.param('fileId'), 'file ID')

  await getWorkspaceContext(workspaceId, userId)

  const file = await getImage(fileId)
  if (!file) throw new HttpError(404, 'File not found')
  assertFileInWorkspace(file, workspaceId)

  const freedBytes = await removeStoredFile(file, workspaceId)

  return successResponse(c, 200, { id: fileId, freedBytes })
}

// DELETE /collections/workspace/:workspaceId/folder/:id
export const deleteFolder = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  const folderId = parseParamId(c.req.param('id'), 'folder ID')

  await getWorkspaceContext(workspaceId, userId)

  const folder = await getImageCollection(folderId)
  if (!folder) throw new HttpError(404, 'Folder not found')
  assertFolderInWorkspace(folder, workspaceId)

  const files = await getImagesByCollection(folderId)
  let freedBytes = 0

  for (const file of files) {
    freedBytes += await removeStoredFile(file, workspaceId)
  }

  await deleteImageCollection(folderId)

  return successResponse(c, 200, { id: folderId, freedBytes, deletedFiles: files.length })
}
