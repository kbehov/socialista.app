'use server'

import { auth } from '@/auth'
import { getInfluencer } from '@/services/influencer.service'
import { getUgcProject, updateUgcClip } from '@/services/ugc-project.service'
import { generateUgcAdScript } from '@socialista/ai'
import {
  ugcClipShowsScript,
  ugcResolvedInfluencerId,
  type UgcProject,
} from '@socialista/types'

export type GenerateUgcClipScriptResult =
  | { success: true; project: UgcProject }
  | { success: false; error: string }

const MAX_SCRIPT_REFS = 6

function uniqueUrls(urls: Array<string | undefined>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    const trimmed = url?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
    if (out.length >= MAX_SCRIPT_REFS) break
  }
  return out
}

export async function generateUgcClipScriptAction(input: {
  projectId: string
  clipId: string
  directions?: string
}): Promise<GenerateUgcClipScriptResult> {
  const projectId = input.projectId.trim()
  const clipId = input.clipId.trim()
  if (!projectId || !clipId) {
    return { success: false, error: 'Scene not found' }
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to write a script' }
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
    if (!ugcClipShowsScript(clip.type)) {
      return { success: false, error: 'This scene has no spoken audio' }
    }

    const influencerId = ugcResolvedInfluencerId(project, clip)
    const influencer = influencerId ? (await getInfluencer(influencerId)).data?.influencer : undefined

    const stillUrls = clip.stills.map(still => still.imageUrl)
    const creatorUrls = influencer
      ? [
          influencer.coverImageUrl,
          ...(influencer.galleryImageUrls ?? []),
          ...(influencer.identity?.referenceImageUrls ?? []),
        ]
      : []
    const productUrls =
      clip.referenceImageUrls?.length ? clip.referenceImageUrls : project.productImageUrls
    const media = uniqueUrls([...stillUrls, ...creatorUrls, ...productUrls]).map(imageUrl => ({
      imageUrl,
    }))

    const text = await generateUgcAdScript({
      productName: project.productName,
      productDescription: project.productDescription,
      productKind: project.productKind,
      directions: input.directions?.trim() || undefined,
      influencerName: influencer?.name,
      clipType: clip.type,
      durationSec: clip.durationSec,
      media: media.length > 0 ? media : undefined,
    })

    const updated = await updateUgcClip(project.id, clip.id, {
      script: { text, source: 'ai' },
    })
    if (!updated.success || !updated.data?.project) {
      return { success: false, error: updated.message ?? 'Could not save the script' }
    }

    return { success: true, project: updated.data.project }
  } catch (error) {
    console.error('[generateUgcClipScriptAction]', error)
    return { success: false, error: 'Could not write a script. Please try again.' }
  }
}
