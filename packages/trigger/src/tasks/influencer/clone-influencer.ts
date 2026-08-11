import { buildCloneCoverPrompt, buildInfluencerBasePromptFragment, generateImage } from '@socialista/ai'
import {
  connectDb,
  createInfluencer,
  disconnectDb,
  getInfluencerCloneRequestById,
  InfluencerCloneRequestStatus,
  InfluencerIdentityMethod,
  InfluencerSource,
  InfluencerStatus,
  InfluencerVisibility,
  updateInfluencer,
  updateInfluencerCloneRequest,
  type InfluencerAppearance,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { cloneInfluencerPayloadSchema } from '../../schemas/clone-influencer.schema.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

const DEFAULT_CLONE_APPEARANCE: InfluencerAppearance = {
  hairColor: 'as in reference photos',
  hairStyle: 'as in reference photos',
  eyeColor: 'as in reference photos',
  skinTone: 'as in reference photos',
  bodyShape: 'as in reference photos',
}

const COVER_SHOT_COUNT = 2

export const cloneInfluencer = schemaTask({
  id: TASK_IDS.cloneInfluencer,
  schema: cloneInfluencerPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    let influencerId: string | undefined

    try {
      await connectDb()

      const request = await getInfluencerCloneRequestById(payload.cloneRequestId)
      if (!request) {
        throw new Error('Clone request not found')
      }
      if (!request.consentConfirmedAt) {
        throw new Error('Consent is required before cloning')
      }
      if (request.uploadedImageUrls.length < 3) {
        throw new Error('At least 3 reference photos are required')
      }

      await updateInfluencerCloneRequest(payload.cloneRequestId, {
        status: InfluencerCloneRequestStatus.PROCESSING,
        trainingJobId: ctx.run.id,
        error: null,
      })

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost * COVER_SHOT_COUNT)

      const appearance = request.appearance ?? DEFAULT_CLONE_APPEARANCE
      const basePromptFragment = buildInfluencerBasePromptFragment({
        name: request.name,
        gender: request.gender,
        ageRange: request.ageRange,
        ethnicity: request.ethnicity,
        appearance,
      })

      setGenerationStatus(15, 'Creating influencer profile')

      const influencer = await createInfluencer({
        workspace: payload.workspaceId,
        createdBy: payload.userId,
        visibility: InfluencerVisibility.PRIVATE,
        source: InfluencerSource.CLONED,
        name: request.name,
        bio: request.bio,
        niche: request.niche,
        gender: request.gender,
        ageRange: request.ageRange,
        ethnicity: request.ethnicity,
        appearance,
        aestheticTags: request.aestheticTags,
        identity: {
          method: InfluencerIdentityMethod.REFERENCE,
          seed: Math.floor(Math.random() * 1_000_000_000),
          basePromptFragment,
          referenceImageUrls: request.uploadedImageUrls,
        },
        status: InfluencerStatus.GENERATING,
        galleryImageUrls: [],
      })
      influencerId = influencer._id.toString()

      logger.info('Generating clone covers', {
        cloneRequestId: payload.cloneRequestId,
        influencerId,
        refs: request.uploadedImageUrls.length,
      })

      const galleryImageUrls: string[] = []
      const coverPrompts = [
        buildCloneCoverPrompt({ name: request.name }),
        buildCloneCoverPrompt({
          name: request.name,
          promptSuffix:
            'Three-quarter turn portrait from the chest up, candid half-smile, natural daylight.',
        }),
      ]

      for (let i = 0; i < coverPrompts.length; i++) {
        setGenerationStatus(30 + i * 30, `Generating cover ${i + 1}`)
        const imageUrl = await generateImage(
          {
            model: model.value,
            provider: model.modelProvider,
            prompt: `${coverPrompts[i]}\n\nNo watermarks, or ai generated text and labels`,
            aspectRatio: '1:1',
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            imageUrls: request.uploadedImageUrls.slice(0, 3),
          },
          setGenerationStatus,
        )
        galleryImageUrls.push(imageUrl)
        await finalizeGeneration(payload.workspaceId, model)
      }

      const referenceImageUrls = [...request.uploadedImageUrls, ...galleryImageUrls]
      const coverImageUrl = galleryImageUrls[0] ?? request.uploadedImageUrls[0]

      await updateInfluencer(influencerId, {
        status: InfluencerStatus.READY,
        coverImageUrl,
        galleryImageUrls,
        identity: { referenceImageUrls },
        error: null,
      })

      await updateInfluencerCloneRequest(payload.cloneRequestId, {
        status: InfluencerCloneRequestStatus.READY,
        resultInfluencerId: influencerId,
        error: null,
      })

      setGenerationStatus(100, 'Complete')

      return {
        cloneRequestId: payload.cloneRequestId,
        influencerId,
        coverImageUrl,
        galleryImageUrls,
      }
    } catch (error) {
      setGenerationFailure(error, 'Influencer clone failed')
      const message = error instanceof Error ? error.message : 'Influencer clone failed'
      await updateInfluencerCloneRequest(payload.cloneRequestId, {
        status: InfluencerCloneRequestStatus.FAILED,
        error: message,
      }).catch(() => undefined)
      if (influencerId) {
        await updateInfluencer(influencerId, {
          status: InfluencerStatus.FAILED,
          error: message,
        }).catch(() => undefined)
      }
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})
