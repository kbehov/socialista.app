import { serve } from '@hono/node-server'
import { connectDb } from '@socialista/db'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
// config dotenv
config()
// init app
const app = new Hono()

// middlewares
app.use(logger())
app.use(compress())

//connect to database
await connectDb()

app.get('/', c => {
  return c.text('Hello Hono!')
})

serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT ?? '8080'),
  },
  info => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
