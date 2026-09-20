'use server'

import { auth } from '@/auth'
import { ApiError } from '@/lib/api'
import { getInfluencer } from '@/services/influencer.service'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { planUgcAd } from '@socialista/ai'
import {
  DEFAULT_GENERATION_CREDIT_COST,
  type UgcAdPlan,
  type UgcProductKind,
} from '@socialista/types'

export type GenerateUgcAdPlanInput = {
  influencerId: string
  description: string
  product?: {
    imageUrls: string[]
    productName?: string
    productDescription?: string
    productUrl?: string | null
    productKind?: UgcProductKind | null
  }
}

export type GenerateUgcAdPlanResult =
  | { success: true; plan: UgcAdPlan }
  | { success: false; error: string }

function influencerCoverUrl(coverImageUrl?: string, galleryImageUrls: string[] = []) {
  return coverImageUrl?.trim() || galleryImageUrls.find(url => url.trim()) || ''
}

export async function generateUgcAdPlan(
  input: GenerateUgcAdPlanInput,
): Promise<GenerateUgcAdPlanResult> {
  const influencerId = input.influencerId.trim()
  const description = input.description.trim()
  if (!influencerId) {
    return { success: false, error: 'Pick a creator' }
  }
  if (!description) {
    return { success: false, error: 'Describe the video you want to build' }
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to plan a video' }
    }

    const workspace = await getCurrentWorkspace()
    if (!workspace) {
      return { success: false, error: 'You must be in a workspace to plan a video' }
    }

    const influencerRes = await getInfluencer(influencerId)
    const influencer = influencerRes.data?.influencer
    if (!influencerRes.success || !influencer) {
      return { success: false, error: 'Creator not found' }
    }

    const influencerImageUrl = influencerCoverUrl(
      influencer.coverImageUrl,
      influencer.galleryImageUrls,
    )
    if (!influencerImageUrl) {
      return { success: false, error: 'This creator has no photo yet' }
    }

    const productName = input.product?.productName?.trim()
    const productDescription = input.product?.productDescription?.trim()
    const productUrl = input.product?.productUrl?.trim()
    const productImages = (input.product?.imageUrls ?? []).filter(Boolean)
    const hasProduct = Boolean(productName || productDescription || productUrl || productImages.length > 0)

    const plan = await planUgcAd({
      description,
      influencerName: influencer.name,
      influencerImageUrl,
      aspectRatio: '9:16',
      ...(hasProduct
        ? {
            product: {
              imageUrls: productImages,
              ...(productName ? { name: productName } : {}),
              ...(productDescription ? { description: productDescription } : {}),
              ...(productUrl ? { url: productUrl } : {}),
              ...(input.product?.productKind ? { kind: input.product.productKind } : {}),
            },
          }
        : {}),
    })

    try {
      await deductWorkspaceAiCredits(workspace._id, DEFAULT_GENERATION_CREDIT_COST)
    } catch (error) {
      console.error('[generateUgcAdPlan] credits', error)
    }

    return { success: true, plan }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      return { success: false, error: 'Creator not found' }
    }
    console.error('[generateUgcAdPlan]', error)
    return { success: false, error: 'Could not plan this video. Please try again.' }
  }
}
