import '@/env.js'
import authRoutes from '@/routes/auth.routes.js'
import inspirationRoutes from '@/routes/inspiration.routes.js'
import invitationRoutes from '@/routes/invitation.routes.js'
import userRoutes from '@/routes/user.routes.js'
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
serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT ?? '8080', 10),
  },
  info => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
