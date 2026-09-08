import {
  ugcClipRequiresCreator,
  ugcClipRequiresProduct,
  ugcClipRequiresScript,
  ugcClipShowsScript,
  type UgcClip,
  type UgcProject,
} from '@socialista/types'

export type UgcStage = 'setup' | 'script' | 'stills' | 'review' | 'video' | 'done'

export function hasUgcProduct(project: UgcProject): boolean {
  return (
    project.productImageUrls.length > 0 ||
    Boolean(project.productName?.trim()) ||
    Boolean(project.productDescription?.trim()) ||
    Boolean(project.productUrl?.trim())
  )
}

export function clipHasStill(clip: UgcClip): boolean {
  return clip.stills.some(still => Boolean(still.imageUrl))
}

/** Scene photos from generation — excludes campaign product / reference assets mixed into stills. */
export function ugcClipGeneratedStills(clip: UgcClip, productImageUrls: string[] = []) {
  const campaignUrls = new Set([
    ...productImageUrls,
    ...(clip.referenceImageUrls ?? []),
  ])
  return clip.stills.filter(still => {
    if (!still.imageUrl) return false
    if (still.generationId || still.enhancedPrompt) return true
    return !campaignUrls.has(still.imageUrl)
  })
}

export function clipHasScript(clip: UgcClip): boolean {
  return Boolean(clip.script?.text.trim())
}

export function clipHasAudio(clip: UgcClip): boolean {
  return Boolean(clip.audioUrl)
}

export function ugcClipNextHint(project: UgcProject, clip: UgcClip): string {
  if (ugcClipRequiresCreator(clip.type) && !project.influencerId && !clip.influencerId) {
    return 'Pick a creator for this scene'
  }
  if (ugcClipRequiresProduct(clip.type) && project.productImageUrls.length === 0 && (clip.referenceImageUrls?.length ?? 0) === 0) {
    return 'Add a product photo'
  }
  if (ugcClipRequiresScript(clip.type) && !clipHasScript(clip)) {
    return 'Write or generate a script (max 120 chars)'
  }
  if (ugcClipShowsScript(clip.type) && clipHasScript(clip) && !clipHasAudio(clip) && clip.voice?.enabled !== false) {
    return 'Generate the voiceover'
  }
  if (!clipHasStill(clip)) return 'Generate the first-scene photo'
  if (!clip.videoUrl) return 'Generate the video'
  return 'Scene ready'
}

export function ugcSceneBadge(clip: UgcClip, generating: boolean): string {
  if (generating) return 'Working'
  if (clip.videoUrl) return 'Rendered'
  if (clip.approved) return 'Approved'
  if (clipHasStill(clip)) return 'Photo ready'
  if (clipHasScript(clip)) return 'Script ready'
  return 'Scene'
}

export function ugcNeedsCreator(project: UgcProject): boolean {
  return project.clips.some(clip => ugcClipRequiresCreator(clip.type))
}

export function deriveUgcStage(project: UgcProject): UgcStage {
  if (!hasUgcProduct(project) || project.clips.length === 0) return 'setup'

  const stillsReady = project.clips.every(clipHasStill)
  if (!stillsReady) {
    const requiredScript = project.clips.filter(clip => ugcClipRequiresScript(clip.type))
    if (requiredScript.some(clip => !clipHasScript(clip))) return 'script'
    return 'stills'
  }

  const withPhotos = project.clips.filter(clipHasStill)
  if (withPhotos.some(clip => !clip.approved)) return 'review'

  const approved = withPhotos.filter(clip => clip.approved)
  const videosReady = approved.length > 0 && approved.every(clip => Boolean(clip.videoUrl))
  if (!videosReady) return 'video'

  if (project.assembledVideoUrl) return 'done'
  return 'video'
}

export function ugcStageHint(project: UgcProject): string | undefined {
  if (!hasUgcProduct(project)) return 'Add a product first'
  if (project.clips.length === 0) return 'Add scenes first'
  if (ugcNeedsCreator(project) && !project.influencerId) return 'Pick a creator first'
  return undefined
}
