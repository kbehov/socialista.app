import {
  ugcClipRequiresCreator,
  ugcClipRequiresScript,
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

export function clipHasScript(clip: UgcClip): boolean {
  return Boolean(clip.script?.text.trim())
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
