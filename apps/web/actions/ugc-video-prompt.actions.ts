'use server'

import { auth } from '@/auth'
import { getInfluencer } from '@/services/influencer.service'
import { getUgcProject, updateUgcClip } from '@/services/ugc-project.service'
import { generateUgcVideoPrompt } from '@socialista/ai'
import {
  clampUgcDuration,
  ugcClipAudioMode,
  ugcClipAudioTakes,
  ugcClipRenderDurationSec,
  ugcResolvedClipModels,
  ugcResolvedInfluencerId,
  type UgcClip,
  type UgcProject,
} from '@socialista/types'

export type GenerateUgcClipVideoPromptResult =
  | { success: true; project: UgcProject }
  | { success: false; error: string }

function referenceImageUrl(value?: string): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return trimmed
  } catch {
    return undefined
  }
}

function recordedScript(clip: UgcClip): string | undefined {
  if (!clip.audioUrl) return undefined
  const takeScript = ugcClipAudioTakes(clip)
    .find(take => take.audioUrl === clip.audioUrl)
    ?.scriptText?.trim()
  const text = takeScript || clip.script?.text?.trim()
  return text || undefined
}

function startFrameUrl(clip: UgcClip, requested?: string): string | undefined {
  return (
    referenceImageUrl(requested) ??
    clip.stills.find(still => still.imageUrl)?.imageUrl
  )
}

export async function generateUgcClipVideoPromptAction(input: {
  projectId: string
  clipId: string
  directions?: string
  referenceImageUrl?: string
}): Promise<GenerateUgcClipVideoPromptResult> {
  const projectId = input.projectId.trim()
  const clipId = input.clipId.trim()
  if (!projectId || !clipId) {
    return { success: false, error: 'Scene not found' }
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to write a video prompt' }
    }

    const loaded = await getUgcProject(projectId)
    const project = loaded.data?.project
    if (!loaded.success || !project) {
      return { success: false, error: loaded.message ?? 'UGC project not found' }
    }

    const clip = project.clips.find(item => item.id === clipId)
    if (!clip) {
      return { success: false, error: 'Scene not found' }
    }
    if (clip.status === 'generating') {
      return { success: false, error: 'This clip is already generating. Wait for it to finish.' }
    }

    const imageUrl = startFrameUrl(clip, input.referenceImageUrl)
    if (!imageUrl) {
      return { success: false, error: 'Add a scene photo first, then write the video prompt.' }
    }

    const influencerId = ugcResolvedInfluencerId(project, clip)
    const influencer = influencerId ? (await getInfluencer(influencerId)).data?.influencer : undefined
    const script = recordedScript(clip)
    const durationSec = clampUgcDuration(
      ugcClipRenderDurationSec(clip, clip.type) ?? clip.durationSec,
    )
    const videoModel = ugcResolvedClipModels(project, clip).video

    const generated = await generateUgcVideoPrompt({
      productName: project.productName,
      productDescription: project.productDescription,
      productKind: project.productKind,
      influencerName: influencer?.name,
      clipType: clip.type,
      durationSec,
      aspectRatio: project.aspectRatio,
      videoModel,
      audioMode: ugcClipAudioMode(clip.type, Boolean(clip.audioUrl)),
      directions: input.directions?.trim() || undefined,
      ...(script ? { script } : {}),
      media: [{ imageUrl }],
    })

    const updated = await updateUgcClip(project.id, clip.id, {
      directions: generated.prompt,
      plannedPrompt: generated.prompt,
      ...(generated.negativePrompt ? { negativePrompt: generated.negativePrompt } : {}),
    })
    if (!updated.success || !updated.data?.project) {
      return { success: false, error: updated.message ?? 'Could not save the video prompt' }
    }

    return { success: true, project: updated.data.project }
  } catch (error) {
    console.error('[generateUgcClipVideoPromptAction]', error)
    return { success: false, error: 'Could not write a video prompt. Please try again.' }
  }
}
