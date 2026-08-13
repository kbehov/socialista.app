'use client'

import {
  UGC_IMAGE_MODELS_QUERY,
  UGC_SCRIPT_MODELS_QUERY,
  UGC_VIDEO_MODELS_QUERY,
} from '@/lib/studio/ugc/model-filters'
import { getInfluencer } from '@/services/influencer.service'
import { getModels } from '@/services/models.service'
import { getWorkspaceProducts } from '@/services/product.service'
import type { Influencer, Model, Product, UgcClip, UgcProject } from '@socialista/types'
import { ContextSupport } from '@socialista/types'
import { create } from 'zustand'

type UgcProjectData = {
  project: UgcProject | null
  influencersById: Record<string, Influencer>
  imageModels: Model[]
  scriptModels: Model[]
  videoModels: Model[]
  modelsLoaded: boolean
  modelsLoading: boolean
  products: Product[]
  productsTruncated: boolean
  productsLoaded: boolean
  productsLoading: boolean
  productsWorkspaceId: string | null
}

type UgcProjectActions = {
  hydrate: (project: UgcProject) => void
  setProject: (project: UgcProject) => void
  patchProjectLocal: (patch: Partial<UgcProject>) => void
  patchClipLocal: (clipId: string, patch: Partial<UgcClip>) => void
  cacheInfluencers: (influencers: Influencer[]) => void
  ensureInfluencer: (id: string) => Promise<void>
  ensureModels: () => Promise<void>
  ensureProducts: (workspaceId: string) => Promise<void>
  reset: () => void
}

type UgcProjectState = UgcProjectData & UgcProjectActions

const initialData: UgcProjectData = {
  project: null,
  influencersById: {},
  imageModels: [],
  scriptModels: [],
  videoModels: [],
  modelsLoaded: false,
  modelsLoading: false,
  products: [],
  productsTruncated: false,
  productsLoaded: false,
  productsLoading: false,
  productsWorkspaceId: null,
}

let modelsPromise: Promise<void> | null = null
let productsPromise: Promise<void> | null = null
const influencerPromises = new Map<string, Promise<void>>()

export const useUgcProjectStore = create<UgcProjectState>((set, get) => ({
  ...initialData,

  hydrate: project => {
    set({ project })
  },

  setProject: project => {
    set({ project })
  },

  patchProjectLocal: patch => {
    set(state => {
      if (!state.project) return state
      return { project: { ...state.project, ...patch } }
    })
  },

  patchClipLocal: (clipId, patch) => {
    set(state => {
      if (!state.project) return state
      return {
        project: {
          ...state.project,
          clips: state.project.clips.map(clip => (clip.id === clipId ? { ...clip, ...patch } : clip)),
        },
      }
    })
  },

  cacheInfluencers: influencers => {
    if (influencers.length === 0) return
    set(state => {
      const next = { ...state.influencersById }
      for (const influencer of influencers) next[influencer._id] = influencer
      return { influencersById: next }
    })
  },

  ensureInfluencer: async id => {
    if (get().influencersById[id]) return
    const inflight = influencerPromises.get(id)
    if (inflight) return inflight

    const request = getInfluencer(id)
      .then(response => {
        const influencer = response.data?.influencer
        if (influencer) get().cacheInfluencers([influencer])
      })
      .finally(() => {
        influencerPromises.delete(id)
      })

    influencerPromises.set(id, request)
    return request
  },

  ensureModels: async () => {
    if (get().modelsLoaded) return
    if (modelsPromise) return modelsPromise

    set({ modelsLoading: true })
    modelsPromise = Promise.all([
      getModels(UGC_IMAGE_MODELS_QUERY),
      getModels(UGC_SCRIPT_MODELS_QUERY),
      getModels(UGC_VIDEO_MODELS_QUERY),
    ])
      .then(([imageResponse, scriptResponse, videoResponse]) => {
        set({
          imageModels: (imageResponse.data?.models ?? []).filter(model =>
            model.contextSupports?.includes(ContextSupport.IMAGE),
          ),
          scriptModels: scriptResponse.data?.models ?? [],
          videoModels: videoResponse.data?.models ?? [],
          modelsLoaded: true,
          modelsLoading: false,
        })
      })
      .catch(() => {
        set({ modelsLoading: false })
      })
      .finally(() => {
        modelsPromise = null
      })

    return modelsPromise
  },

  ensureProducts: async workspaceId => {
    if (get().productsLoaded && get().productsWorkspaceId === workspaceId) return
    if (productsPromise) return productsPromise

    set({ productsLoading: true })
    productsPromise = getWorkspaceProducts(workspaceId, { limit: 50, sort: '-updatedAt' })
      .then(response => {
        const products = response.data?.products ?? []
        set({
          products,
          productsTruncated: (response.meta?.total ?? products.length) > products.length,
          productsLoaded: true,
          productsLoading: false,
          productsWorkspaceId: workspaceId,
        })
      })
      .catch(() => {
        set({ productsLoading: false })
      })
      .finally(() => {
        productsPromise = null
      })

    return productsPromise
  },

  reset: () => {
    modelsPromise = null
    productsPromise = null
    influencerPromises.clear()
    set(initialData)
  },
}))
