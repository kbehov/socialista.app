import {
  addFileToCollection,
  createCollection,
  deleteFile,
  deleteFolder,
  getCollectionById,
  getCollections,
  getWorkspaceImages,
  uploadToWorkspace,
} from '@/controllers/collection.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const collectionRoutes = new Hono<AppContext>()

collectionRoutes.use('/*', authMiddleware)

collectionRoutes.get('/', getCollections)
collectionRoutes.post('/', createCollection)
collectionRoutes.get('/:id', getCollectionById)

// Image routes — scoped under /workspace/:workspaceId
collectionRoutes.get('/workspace/:workspaceId/images', getWorkspaceImages)
collectionRoutes.post('/workspace/:workspaceId/files', uploadToWorkspace)
collectionRoutes.delete('/workspace/:workspaceId/files/:fileId', deleteFile)
collectionRoutes.post('/workspace/:workspaceId/collection/:id/files', addFileToCollection)
collectionRoutes.delete('/workspace/:workspaceId/folder/:id', deleteFolder)

export { collectionRoutes }
