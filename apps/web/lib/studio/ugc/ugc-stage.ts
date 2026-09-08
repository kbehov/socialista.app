import {
  ugcClipRequiresCreator,
  type UgcClip,
  type UgcProject,
} from '@socialista/types'

export function hasUgcProduct(project: UgcProject): boolean {
  return (
    project.productImageUrls.length > 0 ||
    Boolean(project.productName?.trim()) ||
    Boolean(project.productDescription?.trim()) ||
    Boolean(project.productUrl?.trim())
  )
}

function clipHasStill(clip: UgcClip): boolean {
  return clip.stills.some(still => Boolean(still.imageUrl))
}

function clipHasScript(clip: UgcClip): boolean {
  return Boolean(clip.script?.text.trim())
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
