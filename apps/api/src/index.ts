import '@/env.js'
import accountRoutes from '@/routes/account.routes.js'
import authRoutes from '@/routes/auth.routes.js'
import { collectionRoutes } from '@/routes/collection.routes.js'
import { cronRoutes } from '@/routes/cron.routes.js'
import generationRoutes from '@/routes/generation.routes.js'
import { generatedImageRoutes } from '@/routes/generated-image.routes.js'
import { generatedVideoRoutes } from '@/routes/generated-video.routes.js'
import inspirationRoutes from '@/routes/inspiration.routes.js'
import invitationRoutes from '@/routes/invitation.routes.js'
import { influencerRoutes } from '@/routes/influencer.routes.js'
import { ugcProjectRoutes } from '@/routes/ugc-project.routes.js'
import aiCompanyRoutes from '@/routes/ai-company.routes.js'
import modelRoutes from '@/routes/model.routes.js'
import notificationRoutes from '@/routes/notification.routes.js'
import brandRoutes from '@/routes/brand.routes.js'
import productRoutes from '@/routes/product.routes.js'
import projectRoutes from '@/routes/project.routes.js'
import skillRoutes from '@/routes/skill.routes.js'
import staticAdTemplateRoutes from '@/routes/static-ad-templates.routes.js'
import postRoutes from '@/routes/post.routes.js'
import { slideshowRoutes } from '@/routes/slideshow.routes.js'
import userRoutes from '@/routes/user.routes.js'
import { videoRoutes } from '@/routes/video.routes.js'
import waitlistRoutes from '@/routes/waitlist.routes.js'
import workspaceRoutes from '@/routes/workspace.routes.js'
import { toHttpError } from '@/utils/common.utils.js'
import { errorResponse } from '@/utils/http-response.js'
import { serve } from '@hono/node-server'
import { connectDb } from '@socialista/db'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
const app = new Hono()

app.use(logger())
app.use(compress())

app.onError((error, c) => {
  const mapped = toHttpError(error)
  console.log(error)
  console.error(`Error: ${mapped.message} : ${c.req.url}`)
  return errorResponse(c, mapped.status, mapped.message)
})

await connectDb()

// app.get('/', c => c.text('Hello Socialista!'))

app.route('/auth', authRoutes)
app.route('/users', userRoutes)
app.route('/workspaces', workspaceRoutes)
app.route('/invitations', invitationRoutes)
app.route('/inspirations', inspirationRoutes)
app.route('/collections', collectionRoutes)
app.route('/generated-images', generatedImageRoutes)
app.route('/generated-videos', generatedVideoRoutes)
app.route('/generations', generationRoutes)
app.route('/influencers', influencerRoutes)
app.route('/ugc-projects', ugcProjectRoutes)
app.route('/slideshows', slideshowRoutes)
app.route('/videos', videoRoutes)
app.route('/models', modelRoutes)
app.route('/ai-companies', aiCompanyRoutes)
app.route('/notifications', notificationRoutes)
app.route('/brands', brandRoutes)
app.route('/products', productRoutes)
app.route('/projects', projectRoutes)
app.route('/skills', skillRoutes)
app.route('/static-ad-templates', staticAdTemplateRoutes)
app.route('/posts', postRoutes)
app.route('/accounts', accountRoutes)
app.route('/waitlist', waitlistRoutes)
app.route('/cron', cronRoutes)
serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT ?? '8080', 10),
  },
  info => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
