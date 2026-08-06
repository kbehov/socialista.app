import { z } from 'zod'

const canvasDimensionsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const exportSettingsSchema = z.object({
  resolution: canvasDimensionsSchema,
  fps: z.number().int().positive().max(120),
  quality: z.enum(['low', 'medium', 'high']),
})

export const videoExportPayloadSchema = z.object({
  videoId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  settings: exportSettingsSchema,
})

export type VideoExportPayload = z.infer<typeof videoExportPayloadSchema>
