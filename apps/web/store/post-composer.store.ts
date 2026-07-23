'use client'

import { create } from 'zustand'

import {
  createEmptyVariant,
  formatTimeInput,
} from '@/components/posts/composer/composer-utils'
import type {
  ComposerData,
  ComposerMediaItem,
  ComposerSchedule,
  ComposerVariant,
} from '@/components/posts/composer/composer-types'

type ComposerActions = {
  hydrate: (workspaceId: string, timezone: string) => void
  setSelectedAccountIds: (ids: string[]) => void
  toggleAccount: (accountId: string) => void
  setCommonCaption: (caption: string) => void
  addMedia: (item: ComposerMediaItem) => void
  removeMedia: (index: number) => void
  reorderMedia: (fromIndex: number, toIndex: number) => void
  updateMediaAltText: (index: number, altText: string) => void
  setVariant: (accountId: string, patch: Partial<Omit<ComposerVariant, 'accountId'>>) => void
  clearVariantField: (accountId: string, field: 'caption' | 'description' | 'altText') => void
  setSchedule: (patch: Partial<ComposerSchedule>) => void
  setPreviewAccountId: (accountId: string | null) => void
  reset: () => void
}

type ComposerState = ComposerData & ComposerActions

const initialSchedule = (): ComposerSchedule => ({
  mode: 'schedule',
  date: undefined,
  time: formatTimeInput(new Date(Date.now() + 60 * 60 * 1000)),
  timezone: 'UTC',
})

const initialData = (): ComposerData => ({
  workspaceId: '',
  selectedAccountIds: [],
  commonCaption: '',
  media: [],
  variants: {},
  schedule: initialSchedule(),
  previewAccountId: null,
})

export const usePostComposerStore = create<ComposerState>()((set, get) => ({
  ...initialData(),

  hydrate: (workspaceId, timezone) => {
    set({
      ...initialData(),
      workspaceId,
      schedule: {
        ...initialSchedule(),
        timezone,
      },
    })
  },

  setSelectedAccountIds: ids => {
    const unique = [...new Set(ids)]
    set(state => {
      const variants = { ...state.variants }
      for (const id of unique) {
        if (!variants[id]) variants[id] = createEmptyVariant(id)
      }
      const previewAccountId =
        state.previewAccountId && unique.includes(state.previewAccountId)
          ? state.previewAccountId
          : (unique[0] ?? null)
      return {
        selectedAccountIds: unique,
        variants,
        previewAccountId,
      }
    })
  },

  toggleAccount: accountId => {
    const { selectedAccountIds } = get()
    if (selectedAccountIds.includes(accountId)) {
      get().setSelectedAccountIds(selectedAccountIds.filter(id => id !== accountId))
      return
    }
    get().setSelectedAccountIds([...selectedAccountIds, accountId])
  },

  setCommonCaption: caption => set({ commonCaption: caption }),

  addMedia: item =>
    set(state => ({
      media: [...state.media, item],
    })),

  removeMedia: index =>
    set(state => ({
      media: state.media.filter((_, i) => i !== index),
    })),

  reorderMedia: (fromIndex, toIndex) =>
    set(state => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.media.length ||
        toIndex >= state.media.length ||
        fromIndex === toIndex
      ) {
        return state
      }
      const next = [...state.media]
      const [moved] = next.splice(fromIndex, 1)
      if (!moved) return state
      next.splice(toIndex, 0, moved)
      return { media: next }
    }),

  updateMediaAltText: (index, altText) =>
    set(state => ({
      media: state.media.map((item, i) => {
        if (i !== index || item.kind !== 'image') return item
        return { ...item, altText }
      }),
    })),

  setVariant: (accountId, patch) =>
    set(state => {
      const existing = state.variants[accountId] ?? createEmptyVariant(accountId)
      return {
        variants: {
          ...state.variants,
          [accountId]: { ...existing, ...patch, accountId },
        },
      }
    }),

  clearVariantField: (accountId, field) =>
    set(state => {
      const existing = state.variants[accountId] ?? createEmptyVariant(accountId)
      return {
        variants: {
          ...state.variants,
          [accountId]: { ...existing, [field]: '' },
        },
      }
    }),

  setSchedule: patch =>
    set(state => ({
      schedule: { ...state.schedule, ...patch },
    })),

  setPreviewAccountId: accountId => set({ previewAccountId: accountId }),

  reset: () => set(initialData()),
}))

export const usePostComposerActions = () => {
  const hydrate = usePostComposerStore(s => s.hydrate)
  const setSelectedAccountIds = usePostComposerStore(s => s.setSelectedAccountIds)
  const toggleAccount = usePostComposerStore(s => s.toggleAccount)
  const setCommonCaption = usePostComposerStore(s => s.setCommonCaption)
  const addMedia = usePostComposerStore(s => s.addMedia)
  const removeMedia = usePostComposerStore(s => s.removeMedia)
  const reorderMedia = usePostComposerStore(s => s.reorderMedia)
  const updateMediaAltText = usePostComposerStore(s => s.updateMediaAltText)
  const setVariant = usePostComposerStore(s => s.setVariant)
  const clearVariantField = usePostComposerStore(s => s.clearVariantField)
  const setSchedule = usePostComposerStore(s => s.setSchedule)
  const setPreviewAccountId = usePostComposerStore(s => s.setPreviewAccountId)
  const reset = usePostComposerStore(s => s.reset)

  return {
    hydrate,
    setSelectedAccountIds,
    toggleAccount,
    setCommonCaption,
    addMedia,
    removeMedia,
    reorderMedia,
    updateMediaAltText,
    setVariant,
    clearVariantField,
    setSchedule,
    setPreviewAccountId,
    reset,
  }
}
