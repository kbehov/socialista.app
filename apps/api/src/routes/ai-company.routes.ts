import {
  createAiCompany,
  deleteAiCompany,
  getAiCompanies,
  getAiCompany,
  updateAiCompany,
  uploadAiCompanyLogo,
} from '@/controllers/ai-company.controller.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import { authMiddleware, type AppContext } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const aiCompanyRoutes = new Hono<AppContext>()

aiCompanyRoutes.use('/*', authMiddleware)

aiCompanyRoutes.get('/', getAiCompanies)
aiCompanyRoutes.post('/logo', adminMiddleware, uploadAiCompanyLogo)
aiCompanyRoutes.get('/:id', getAiCompany)
aiCompanyRoutes.post('/', adminMiddleware, createAiCompany)
aiCompanyRoutes.put('/:id', adminMiddleware, updateAiCompany)
aiCompanyRoutes.delete('/:id', adminMiddleware, deleteAiCompany)

export default aiCompanyRoutes
