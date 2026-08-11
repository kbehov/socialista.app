import { ALLOWED_MIME_TYPES, MAX_AUDIO_SIZE, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '@/config/api.config.js'
import { deleteObjectFromR2, getObjectSizeFromR2, uploadBufferToR2 } from '@/lib/aws.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { withQueryParam, getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceStorageAvailable, getWorkspaceAsMember } from '@/utils/workspace.utils.js'
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
  const { collections, meta } = await getImageCollections(getQueryString(c.req.url))
  return successResponse(c, 200, { collections }, meta)
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
// Optional query: ?collectionId=<id>&page=<n>&limit=<n>&sort=<field>
export const getWorkspaceImages = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')

  await getWorkspaceAsMember(workspaceId, userId)

  const { images, meta } = await getImages(withQueryParam(c.req.url, 'workspace', workspaceId))
  return successResponse(c, 200, { images }, meta)
}

type ProcessedFile = {
  buffer: Buffer
  mimeType: string
  ext: string
  width: number
  height: number
}

function maxSizeForMime(mimeType: string): number {
  if (mimeType.startsWith('image/')) return MAX_IMAGE_SIZE
  if (mimeType.startsWith('audio/')) return MAX_AUDIO_SIZE
  return MAX_VIDEO_SIZE
}

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case 'audio/mpeg':
    case 'audio/mp3':
      return 'mp3'
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'm4a'
    case 'audio/aac':
      return 'aac'
    case 'audio/wav':
    case 'audio/wave':
    case 'audio/x-wav':
      return 'wav'
    case 'audio/ogg':
      return 'ogg'
    case 'audio/webm':
      return 'webm'
    case 'audio/flac':
    case 'audio/x-flac':
      return 'flac'
    case 'video/mp4':
      return 'mp4'
    case 'video/webm':
      return 'webm'
    case 'video/ogg':
      return 'ogv'
    default:
      return mimeType.split('/')[1] ?? 'bin'
  }
}

function inferMimeFromFileName(name: string): string | null {
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined
  if (!ext) return null
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'avif':
      return 'image/avif'
    case 'svg':
      return 'image/svg+xml'
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'ogv':
      return 'video/ogg'
    case 'mp3':
      return 'audio/mpeg'
    case 'm4a':
      return 'audio/mp4'
    case 'aac':
      return 'audio/aac'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
    case 'oga':
      return 'audio/ogg'
    case 'flac':
      return 'audio/flac'
    default:
      return null
  }
}

function resolveUploadMimeType(file: File): string {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) return file.type
  const inferred = inferMimeFromFileName(file.name)
  if (inferred && ALLOWED_MIME_TYPES.has(inferred)) return inferred
  return file.type
}

// Validate the file from FormData and process it:
//   - Images → converted to WebP via sharp (lossless-safe quality 85) and dimensions extracted
//   - Videos / audio → passed through as-is with placeholder 0×0 dimensions
async function processFile(c: Context<AppContext>): Promise<ProcessedFile> {
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }
  const mimeType = resolveUploadMimeType(file)
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new HttpError(400, 'Invalid file type')
  }
  if (file.size > maxSizeForMime(mimeType)) {
    throw new HttpError(400, 'File size exceeds the maximum size')
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())

  if (mimeType.startsWith('image/')) {
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

  // Video / audio: preserve original format, dimensions are not extracted
  return {
    buffer: rawBuffer,
    mimeType,
    ext: extensionForMime(mimeType),
    width: 0,
    height: 0,
  }
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
  return getWorkspaceAsMember(workspaceId, userId)
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

  const workspace = await getWorkspaceAsMember(workspaceId, userId)

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

  const workspace = await getWorkspaceAsMember(workspaceId, userId)

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
    collectionId: toObjectId(collectionId),
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
  const sizes = await Promise.all(files.map(file => removeStoredFile(file, workspaceId)))
  const freedBytes = sizes.reduce((sum, size) => sum + size, 0)

  await deleteImageCollection(folderId)

  return successResponse(c, 200, { id: folderId, freedBytes, deletedFiles: files.length })
}
