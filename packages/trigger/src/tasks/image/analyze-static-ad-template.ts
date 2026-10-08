import { resolvePrompt, staticAdTemplateAnalysisSchema } from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getStaticAdTemplateById,
  setStaticAdTemplateBlueprint,
} from '@socialista/db'
import {
  REGISTRY_PROMPT_KEYS,
  STATIC_AD_TEMPLATE_BLUEPRINT_VERSION,
  TASK_IDS,
} from '@socialista/types'
import { AbortTaskRunError, schemaTask } from '@trigger.dev/sdk/v3'
import { generateObject } from 'ai'
import { z } from 'zod'

const analyzeStaticAdTemplateSchema = z.object({
  templateId: z.string().trim().min(1),
})

export const analyzeStaticAdTemplate = schemaTask({
  id: TASK_IDS.staticAdTemplateAnalysis,
  schema: analyzeStaticAdTemplateSchema,
  maxDuration: 120,
  retry: { maxAttempts: 2 },
  run: async (payload) => {
    try {
      await connectDb()

      const template = await getStaticAdTemplateById(payload.templateId)
      if (!template) {
        throw new AbortTaskRunError(
          `Static ad template not found: ${payload.templateId}`,
        )
      }

      const { model, system } = resolvePrompt(
        REGISTRY_PROMPT_KEYS.staticAdTemplateAnalysis,
      )
      const analyzed = await generateObject({
        model,
        system,
        schema: staticAdTemplateAnalysisSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', image: template.imageUrl },
              {
                type: 'text',
                text: 'Analyze this static ad template and return its structural blueprint.',
              },
            ],
          },
        ],
      })

      const blueprint = analyzed.object
      const saved = await setStaticAdTemplateBlueprint(payload.templateId, {
        format: blueprint.format,
        layout: blueprint.layout,
        typeHierarchy: blueprint.typeHierarchy,
        palette: blueprint.palette.map((swatch) => ({
          hex: swatch.hex,
          role: swatch.role,
        })),
        hookStyle: blueprint.hookStyle,
        sceneJob: blueprint.sceneJob,
        ...(blueprint.aspectRatioHint
          ? { aspectRatioHint: blueprint.aspectRatioHint }
          : {}),
        analyzedAt: new Date(),
        version: STATIC_AD_TEMPLATE_BLUEPRINT_VERSION,
      })
      if (!saved) {
        throw new Error(`Failed to save blueprint for template ${payload.templateId}`)
      }

      return {
        templateId: payload.templateId,
        format: blueprint.format,
      }
    } finally {
      await disconnectDb()
    }
  },
})

export type AnalyzeStaticAdTemplateTask = typeof analyzeStaticAdTemplate
