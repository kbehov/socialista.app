import { fal } from '@fal-ai/client'

fal.config({
  credentials: process.env.FAL_KEY as string,
})

export { fal }
