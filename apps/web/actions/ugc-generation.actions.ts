'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getUgcProject } from '@/services/ugc-project.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { createPublicAccessToken } from '@socialista/trigger'
import type {
  AssembleUgcProjectTask,
  GenerateUgcAudioTask,
  GenerateUgcStillsTask,
  GenerateUgcVideoTask,
} from '@socialista/trigger/task-types'
import {
  clampImageGenerationCount,
  CostUnit,
  TASK_IDS,
  UGC_SCRIPT_MAX_CHARS,
  ugcClipGeneratesAudio,
  ugcResolvedClipVoice,
  videoResolutionCostMultiplier,
  type UgcClip,
  type UgcProject,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'

export type StartUgcGenerationResult =
  | { success: true; runId: string; publicAccessToken: string }
  | { success: false; error: string }

function fail(error: string): StartUgcGenerationResult {
  return { success: false, error }
}

function assertClipIdle(clip: UgcClip): StartUgcGenerationResult | null {
  if (clip.status === 'generating') {
    return fail('This clip is already generating. Wait for it to finish.')
  }
  return null
}

async function loadAuthedProject(projectId: string): Promise<
  { ok: true; userId: string; project: UgcProject } | StartUgcGenerationResult
> {
  const session = await auth()
  if (!session?.user?.id) {
    return fail('You must be signed in to generate.')
  }

  const response = await getUgcProject(projectId)
  if (!response.success || !response.data?.project) {
    return fail(response.message ?? 'UGC project not found')
  }

  return { ok: true, userId: session.user.id, project: response.data.project }
}

async function triggerStills(payload: {
  projectId: string
  workspaceId: string
  userId: string
  clipId?: string
  skipEnhance?: boolean
  prompt?: string
  model?: string
  referenceImageUrls?: string[]
  count?: number
}): Promise<StartUgcGenerationResult> {
  const handle = await tasks.trigger<GenerateUgcStillsTask>(TASK_IDS.generateUgcStills, payload)
  const publicAccessToken = await createPublicAccessToken(handle.id)
  return { success: true, runId: handle.id, publicAccessToken }
}

async function triggerVideo(payload: {
  projectId: string
  workspaceId: string
  userId: string
  clipId: string
  plannedPrompt?: string
  skipPlanner?: boolean
}): Promise<StartUgcGenerationResult> {
  const handle = await tasks.trigger<GenerateUgcVideoTask>(TASK_IDS.generateUgcVideo, payload)
  const publicAccessToken = await createPublicAccessToken(handle.id)
  return { success: true, runId: handle.id, publicAccessToken }
}

async function triggerAudio(payload: {
  projectId: string
  workspaceId: string
  userId: string
  clipId?: string
  text?: string
}): Promise<StartUgcGenerationResult> {
  const handle = await tasks.trigger<GenerateUgcAudioTask>(TASK_IDS.generateUgcAudio, payload)
  const publicAccessToken = await createPublicAccessToken(handle.id)
  return { success: true, runId: handle.id, publicAccessToken }
}

async function triggerAssemble(payload: {
  projectId: string
  workspaceId: string
  userId: string
}): Promise<StartUgcGenerationResult> {
  const handle = await tasks.trigger<AssembleUgcProjectTask>(TASK_IDS.assembleUgcProject, payload)
  const publicAccessToken = await createPublicAccessToken(handle.id)
  return { success: true, runId: handle.id, publicAccessToken }
}

export async function startUgcStillsGeneration(input: {
  projectId: string
  clipId?: string
  skipEnhance?: boolean
  prompt?: string
  model?: string
  referenceImageUrls?: string[]
  count?: number
}): Promise<StartUgcGenerationResult> {
  try {
    const loaded = await loadAuthedProject(input.projectId)
    if (!('ok' in loaded)) return loaded
    const { userId, project } = loaded

    let targets: UgcClip[]
    if (input.clipId) {
      const clip = project.clips.find(item => item.id === input.clipId)
      if (!clip) return fail('Clip not found')
      targets = [clip]
    } else {
      targets = project.clips
    }

    if (targets.length === 0) return fail('Add a scene first')

    for (const clip of targets) {
      const busy = assertClipIdle(clip)
      if (busy) return busy
      if (!(clip.models?.image || project.models.image)) {
        return fail('Choose an image model')
      }
    }

    const prompt = input.prompt?.trim() || undefined
    const model = input.model?.trim() || undefined
    const referenceImageUrls = input.referenceImageUrls?.filter(url => url.length > 0)
    const count = input.count ? clampImageGenerationCount(input.count) : undefined

    return await triggerStills({
      projectId: project.id,
      workspaceId: project.workspaceId,
      userId,
      ...(input.clipId ? { clipId: input.clipId } : {}),
      ...(input.skipEnhance ? { skipEnhance: true } : {}),
      ...(prompt ? { prompt } : {}),
      ...(model ? { model } : {}),
      ...(referenceImageUrls && referenceImageUrls.length > 0 ? { referenceImageUrls } : {}),
      ...(count ? { count } : {}),
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not generate photos')
  }
}

export async function startUgcVideoGeneration(input: {
  projectId: string
  clipId: string
  plannedPrompt?: string
  skipPlanner?: boolean
}): Promise<StartUgcGenerationResult> {
  try {
    const loaded = await loadAuthedProject(input.projectId)
    if (!('ok' in loaded)) return loaded
    const { userId, project } = loaded

    const clip = project.clips.find(item => item.id === input.clipId)
    if (!clip) return fail('Clip not found')
    const busy = assertClipIdle(clip)
    if (busy) return busy
    const videoModelValue = clip.models?.video || project.models.video
    if (!videoModelValue) {
      return fail('Choose a video model')
    }
    if (!clip.stills.some(still => still.imageUrl)) {
      return fail('Generate a photo first')
    }

    const encoded = encodeURIComponent(videoModelValue)
    const [balanceRes, modelsRes] = await Promise.all([
      getWorkspaceBalance(project.workspaceId),
      getModels(`limit=20&modelType=video&value=${encoded}`),
    ])
    const model = modelsRes.data?.models[0]
    if (!model) return fail('Model not found.')

    const billedCost =
      (model.costUnit === CostUnit.PER_SECOND ? model.cost * clip.durationSec : model.cost) *
      videoResolutionCostMultiplier(project.videoResolution)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0
    if (credits < billedCost) {
      return fail('Insufficient AI credits.')
    }

    const plannedPrompt = input.plannedPrompt?.trim() || undefined

    return await triggerVideo({
      projectId: project.id,
      workspaceId: project.workspaceId,
      userId,
      clipId: clip.id,
      ...(plannedPrompt ? { plannedPrompt } : {}),
      ...(input.skipPlanner ? { skipPlanner: true } : {}),
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not generate video')
  }
}

export async function startUgcAudioGeneration(input: {
  projectId: string
  clipId?: string
  text?: string
}): Promise<StartUgcGenerationResult> {
  try {
    const loaded = await loadAuthedProject(input.projectId)
    if (!('ok' in loaded)) return loaded
    const { userId, project } = loaded

    const incoming = input.text?.trim().slice(0, UGC_SCRIPT_MAX_CHARS) || undefined
    let clips: UgcClip[]
    if (input.clipId) {
      const clip = project.clips.find(item => item.id === input.clipId)
      if (!clip) return fail('Clip not found')
      clips = [clip]
    } else {
      clips = project.clips.filter(clip => ugcClipGeneratesAudio(clip.type))
    }

    if (clips.length === 0) {
      return fail(input.clipId ? 'Clip not found' : 'Add a talking scene first')
    }

    const targets: UgcClip[] = []
    for (const clip of clips) {
      const busy = assertClipIdle(clip)
      if (busy) return busy
      const voice = ugcResolvedClipVoice(project, clip)
      if (voice.enabled === false) {
        if (input.clipId) return fail('Voiceover is turned off for this scene')
        continue
      }
      const text = (input.clipId === clip.id ? incoming : undefined) || clip.script?.text.trim()
      if (!text) {
        if (input.clipId) return fail('Write a script before generating audio')
        continue
      }
      if (!ugcClipGeneratesAudio(clip.type)) {
        return fail('This scene has no spoken audio')
      }
      targets.push(clip)
    }

    if (targets.length === 0) {
      return fail('Write a script on a talking scene first')
    }

    const scriptText = input.clipId ? incoming || targets[0]?.script?.text.trim() : undefined

    return await triggerAudio({
      projectId: project.id,
      workspaceId: project.workspaceId,
      userId,
      ...(input.clipId ? { clipId: input.clipId } : {}),
      ...(scriptText ? { text: scriptText } : {}),
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not generate audio')
  }
}

export async function startUgcAssemble(input: {
  projectId: string
}): Promise<StartUgcGenerationResult> {
  try {
    const loaded = await loadAuthedProject(input.projectId)
    if (!('ok' in loaded)) return loaded
    const { userId, project } = loaded

    if (!project.clips.some(clip => Boolean(clip.videoUrl))) {
      return fail('Generate at least one scene video first')
    }

    return await triggerAssemble({
      projectId: project.id,
      workspaceId: project.workspaceId,
      userId,
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not stitch the ad')
  }
}
