import { HttpError } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  getInfluencerById,
  getInfluencerCloneRequestById,
  getModelByValue,
  ContextSupport,
  InfluencerAgeRange as DbInfluencerAgeRange,
  InfluencerGender as DbInfluencerGender,
  InfluencerHeight as DbInfluencerHeight,
  InfluencerPhotoStyle as DbInfluencerPhotoStyle,
  InfluencerShotPack as DbInfluencerShotPack,
  InfluencerStatus,
  InfluencerVisibility,
  type IInfluencer,
  type IInfluencerCloneRequest,
  type InfluencerAppearance,
} from '@socialista/db'
import type {
  Influencer,
  InfluencerAppearance as InfluencerAppearanceDto,
  InfluencerCloneRequest,
  InfluencerIdentity,
} from '@socialista/types'
import {
  INFLUENCER_ACCESSORIES,
  INFLUENCER_ACCESSORIES_MAX,
  INFLUENCER_AGE_RANGES,
  INFLUENCER_DEFAULT_MODEL,
  INFLUENCER_FACIAL_HAIR,
  INFLUENCER_GENDERS,
  INFLUENCER_HEIGHTS,
  INFLUENCER_MAKEUP_STYLES,
  INFLUENCER_PHOTO_STYLES,
  INFLUENCER_SCENES,
  INFLUENCER_SCENES_MAX,
  INFLUENCER_SHOT_PACKS,
} from '@socialista/types'

export function serializeInfluencer(doc: IInfluencer): Influencer {
  return {
    _id: doc._id.toString(),
    workspaceId: doc.workspace?.toString() ?? null,
    ...(doc.project ? { projectId: doc.project.toString() } : {}),
    createdBy: doc.createdBy?.toString() ?? null,
    visibility: doc.visibility,
    source: doc.source,
    name: doc.name,
    bio: doc.bio,
    directions: doc.directions,
    niche: doc.niche,
    scenes: doc.scenes ?? [],
    gender: doc.gender,
    ageRange: doc.ageRange,
    ethnicity: doc.ethnicity,
    appearance: serializeAppearance(doc.appearance),
    aestheticTags: doc.aestheticTags ?? [],
    photoStyle: doc.photoStyle,
    identity: serializeIdentity(doc.identity),
    status: doc.status,
    coverImageUrl: doc.coverImageUrl,
    galleryImageUrls: doc.galleryImageUrls ?? [],
    galleryShots: (doc.galleryShots ?? []).map(shot => ({
      shotId: shot.shotId,
      url: shot.url,
      aspectRatio: shot.aspectRatio,
    })),
    usageCount: doc.usageCount ?? 0,
    error: doc.error,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function serializeAppearance(appearance: InfluencerAppearance): InfluencerAppearanceDto {
  return {
    hairColor: appearance.hairColor,
    hairStyle: appearance.hairStyle,
    eyeColor: appearance.eyeColor,
    skinTone: appearance.skinTone,
    bodyShape: appearance.bodyShape,
    height: appearance.height,
    distinguishingFeatures: appearance.distinguishingFeatures,
    facialHair: appearance.facialHair,
    makeup: appearance.makeup,
    accessories: appearance.accessories,
  }
}

function serializeIdentity(identity: IInfluencer['identity']): InfluencerIdentity {
  return {
    method: identity.method,
    seed: identity.seed,
    basePromptFragment: identity.basePromptFragment,
    referenceImageUrls: identity.referenceImageUrls ?? [],
    userReferenceImageUrls: identity.userReferenceImageUrls?.length
      ? identity.userReferenceImageUrls
      : undefined,
    loraModelId: identity.loraModelId,
    characterSheet: identity.characterSheet
      ? {
          identityLock: identity.characterSheet.identityLock,
          signatureDetails: identity.characterSheet.signatureDetails ?? [],
          wardrobe: {
            casual: identity.characterSheet.wardrobe.casual,
            onCamera: identity.characterSheet.wardrobe.onCamera,
            active: identity.characterSheet.wardrobe.active,
          },
          environments: identity.characterSheet.environments ?? [],
          expressionRange: identity.characterSheet.expressionRange ?? [],
        }
      : undefined,
    shotPack: identity.shotPack,
  }
}

export function serializeCloneRequest(doc: IInfluencerCloneRequest): InfluencerCloneRequest {
  return {
    _id: doc._id.toString(),
    workspaceId: doc.workspace.toString(),
    userId: doc.userId.toString(),
    uploadedImageUrls: doc.uploadedImageUrls,
    consentConfirmedAt: doc.consentConfirmedAt,
    status: doc.status,
    resultInfluencerId: doc.resultInfluencerId?.toString(),
    trainingJobId: doc.trainingJobId,
    error: doc.error,
    name: doc.name,
    bio: doc.bio,
    niche: doc.niche ?? [],
    gender: doc.gender,
    ageRange: doc.ageRange,
    ethnicity: doc.ethnicity,
    appearance: doc.appearance ? serializeAppearance(doc.appearance) : undefined,
    aestheticTags: doc.aestheticTags ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/** Workspace member for private influencers; any auth user for public ready library. */
export async function getInfluencerForViewer(id: string, userId: string): Promise<IInfluencer> {
  const influencer = await getInfluencerById(id)
  if (!influencer) {
    throw new HttpError(404, 'Influencer not found')
  }

  const isPublicReady =
    influencer.visibility === InfluencerVisibility.PUBLIC && influencer.status === InfluencerStatus.READY

  if (isPublicReady) {
    return influencer
  }

  if (!influencer.workspace) {
    throw new HttpError(404, 'Influencer not found')
  }

  await getWorkspaceAsMember(influencer.workspace.toString(), userId)
  return influencer
}

export async function getInfluencerForMember(id: string, userId: string): Promise<IInfluencer> {
  const influencer = await getInfluencerById(id)
  if (!influencer) {
    throw new HttpError(404, 'Influencer not found')
  }
  if (!influencer.workspace) {
    throw new HttpError(403, 'Cannot modify library influencers')
  }
  await getWorkspaceAsMember(influencer.workspace.toString(), userId)
  return influencer
}

export async function getCloneRequestForMember(id: string, userId: string): Promise<IInfluencerCloneRequest> {
  const request = await getInfluencerCloneRequestById(id)
  if (!request) {
    throw new HttpError(404, 'Clone request not found')
  }
  await getWorkspaceAsMember(request.workspace.toString(), userId)
  return request
}

export function parseGender(value: unknown): DbInfluencerGender {
  if (typeof value === 'string' && (INFLUENCER_GENDERS as readonly string[]).includes(value)) {
    return value as DbInfluencerGender
  }
  throw new HttpError(400, 'Valid gender is required')
}

export function parseAgeRange(value: unknown): DbInfluencerAgeRange {
  if (typeof value === 'string' && (INFLUENCER_AGE_RANGES as readonly string[]).includes(value)) {
    return value as DbInfluencerAgeRange
  }
  throw new HttpError(400, 'Valid age range is required (18+ only)')
}

export function parseHeight(value: unknown): DbInfluencerHeight | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'string' && (INFLUENCER_HEIGHTS as readonly string[]).includes(value)) {
    return value as DbInfluencerHeight
  }
  throw new HttpError(400, 'Invalid height')
}

export function parsePhotoStyle(value: unknown): DbInfluencerPhotoStyle | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'string' && (INFLUENCER_PHOTO_STYLES as readonly string[]).includes(value)) {
    return value as DbInfluencerPhotoStyle
  }
  throw new HttpError(400, 'Invalid photo style')
}

export function parseShotPack(value: unknown): DbInfluencerShotPack {
  if (value === undefined || value === null || value === '') {
    return DbInfluencerShotPack.QUICK
  }
  if (typeof value === 'string' && (INFLUENCER_SHOT_PACKS as readonly string[]).includes(value)) {
    return value as DbInfluencerShotPack
  }
  throw new HttpError(400, 'Invalid shot pack (quick | ugc-kit)')
}

export function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean)
}

function parseCatalogStringArray(
  value: unknown,
  allowed: readonly string[],
  label: string,
  max: number,
): string[] {
  const items = parseStringArray(value)
  for (const item of items) {
    if (!allowed.includes(item)) {
      throw new HttpError(400, `Invalid ${label}: ${item}`)
    }
  }
  return [...new Set(items)].slice(0, max)
}

export function parseScenes(value: unknown): string[] {
  if (value === undefined || value === null) return []
  return parseCatalogStringArray(value, INFLUENCER_SCENES, 'scene', INFLUENCER_SCENES_MAX)
}

export function parseAccessories(value: unknown): string[] {
  if (value === undefined || value === null) return []
  return parseCatalogStringArray(
    value,
    INFLUENCER_ACCESSORIES,
    'accessory',
    INFLUENCER_ACCESSORIES_MAX,
  )
}

function parseOptionalEnumMember(
  value: unknown,
  allowed: readonly string[],
  label: string,
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'string' && allowed.includes(value)) {
    return value
  }
  throw new HttpError(400, `Invalid ${label}`)
}

export function parseAppearance(raw: unknown): InfluencerAppearance {
  if (!raw || typeof raw !== 'object') {
    throw new HttpError(400, 'Appearance is required')
  }
  const appearance = raw as Record<string, unknown>
  const hairColor = typeof appearance.hairColor === 'string' ? appearance.hairColor.trim() : ''
  const hairStyle = typeof appearance.hairStyle === 'string' ? appearance.hairStyle.trim() : ''
  const eyeColor = typeof appearance.eyeColor === 'string' ? appearance.eyeColor.trim() : ''
  const skinTone = typeof appearance.skinTone === 'string' ? appearance.skinTone.trim() : ''
  const bodyShape = typeof appearance.bodyShape === 'string' ? appearance.bodyShape.trim() : ''

  if (!hairColor || !hairStyle || !eyeColor || !skinTone || !bodyShape) {
    throw new HttpError(400, 'Appearance requires hairColor, hairStyle, eyeColor, skinTone, and bodyShape')
  }

  return {
    hairColor,
    hairStyle,
    eyeColor,
    skinTone,
    bodyShape,
    height: parseHeight(appearance.height),
    distinguishingFeatures: parseStringArray(appearance.distinguishingFeatures),
    facialHair: parseOptionalEnumMember(appearance.facialHair, INFLUENCER_FACIAL_HAIR, 'facial hair'),
    makeup: parseOptionalEnumMember(appearance.makeup, INFLUENCER_MAKEUP_STYLES, 'makeup'),
    accessories: parseAccessories(appearance.accessories),
  }
}

export function parseOptionalAppearance(raw: unknown): InfluencerAppearance | undefined {
  if (raw === undefined || raw === null) return undefined
  return parseAppearance(raw)
}

export function collectInfluencerMediaUrls(influencer: IInfluencer): string[] {
  const urls = new Set<string>()
  if (influencer.coverImageUrl) urls.add(influencer.coverImageUrl)
  for (const url of influencer.galleryImageUrls ?? []) urls.add(url)
  for (const url of influencer.identity?.referenceImageUrls ?? []) urls.add(url)
  for (const url of influencer.identity?.userReferenceImageUrls ?? []) urls.add(url)
  return [...urls]
}

/**
 * Resolve a catalog model for influencer generation.
 * Requires image context so later anchors can reference the cover portrait.
 */
export async function resolveInfluencerGenerationModel(raw: unknown): Promise<string> {
  const value =
    typeof raw === 'string' && raw.trim() ? raw.trim() : INFLUENCER_DEFAULT_MODEL

  const model = await getModelByValue(value)
  if (!model) {
    throw new HttpError(400, `Model not found: ${value}`)
  }

  const supports = model.contextSupports ?? []
  if (!supports.includes(ContextSupport.IMAGE)) {
    throw new HttpError(
      400,
      'Influencer generation requires a model with image context support',
    )
  }

  return model.value
}
