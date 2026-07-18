import { create } from 'zustand'
import type {
  BackgroundImageAdjustment,
  BackgroundImageFilter,
  ImageLayer,
  LayerId,
  Slide,
  SlideId,
  SlideLayer,
  TextLayer,
  CanvasDimensions,
} from '@socialista/types'
import {
  createSlide,
  createTextLayer,
  createImageLayer,
  cloneLayer,
  reindexLayers,
  sortLayers,
  DEFAULT_CANVAS,
  DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT,
  DEFAULT_VIEWPORT_ZOOM,
  MIN_VIEWPORT_ZOOM,
  MAX_VIEWPORT_ZOOM,
  VIEWPORT_ZOOM_STEP,
  mergeGeneratedTextsIntoSlides,
  normalizeSlide,
} from './defaults'
import { createLayerId, createSlideId } from './id'
import { DEFAULT_ASPECT_RATIO_ID, findAspectRatioId, getAspectRatioPreset } from './aspect-ratios'
import { proxiedImageUrl } from './image-url'

const HISTORY_LIMIT = 50

interface EditorState {
  canvas: CanvasDimensions
  aspectRatioId: string
  viewportZoom: number
  slides: Slide[]
  activeSlideId: SlideId | null
  activeLayerId: LayerId | null
  past: { slides: Slide[]; activeSlideId: SlideId | null; activeLayerId: LayerId | null }[]
  future: { slides: Slide[]; activeSlideId: SlideId | null; activeLayerId: LayerId | null }[]

  slideshowId: string | null
  slideshowName: string
  isDirty: boolean
  lastSavedAt: number | null
  studioPanelTab: 'generate' | 'edit'

  addSlide: (backgroundImageUrl?: string) => void
  removeSlide: (slideId: SlideId) => void
  duplicateSlide: (slideId: SlideId) => void
  reorderSlides: (sourceId: SlideId, targetId: SlideId) => void
  setSlideOrder: (orderedIds: SlideId[]) => void
  setActiveSlide: (slideId: SlideId | null) => void
  setSlideBackground: (slideId: SlideId, imageUrl: string) => void
  setSlideBackgroundColor: (slideId: SlideId, color: string) => void
  setSlideBackgroundImageAdjustment: (slideId: SlideId, adjustment: BackgroundImageAdjustment) => void
  setSlideBackgroundFilter: (slideId: SlideId, filter: BackgroundImageFilter) => void
  removeSlideBackgroundFilter: (slideId: SlideId, filterType: BackgroundImageFilter['type']) => void
  setSlideBackgroundFilterLive: (slideId: SlideId, filter: BackgroundImageFilter) => void
  removeSlideBackgroundFilterLive: (slideId: SlideId, filterType: BackgroundImageFilter['type']) => void
  clearSlideBackgroundImage: (slideId: SlideId) => void

  addTextLayer: (slideId: SlideId) => void
  addImageLayer: (slideId: SlideId, imageUrl?: string) => void
  updateLayer: (slideId: SlideId, layerId: LayerId, partial: Partial<SlideLayer>) => void
  updateLayerStyle: (slideId: SlideId, layerId: LayerId, style: Partial<TextLayer['style']>) => void
  setLayerImageUrl: (slideId: SlideId, layerId: LayerId, imageUrl: string) => void
  setImageLayerFilter: (slideId: SlideId, layerId: LayerId, filter: BackgroundImageFilter) => void
  removeImageLayerFilter: (slideId: SlideId, layerId: LayerId, filterType: BackgroundImageFilter['type']) => void
  setImageLayerFilterLive: (slideId: SlideId, layerId: LayerId, filter: BackgroundImageFilter) => void
  removeImageLayerFilterLive: (slideId: SlideId, layerId: LayerId, filterType: BackgroundImageFilter['type']) => void
  promoteImageLayerToBackground: (slideId: SlideId, layerId: LayerId) => void
  removeLayer: (slideId: SlideId, layerId: LayerId) => void
  duplicateLayer: (slideId: SlideId, layerId: LayerId) => void
  setActiveLayer: (slideId: SlideId | null, layerId: LayerId | null) => void
  clearLayerSelection: () => void
  bringForward: (slideId: SlideId, layerId: LayerId) => void
  sendBackward: (slideId: SlideId, layerId: LayerId) => void
  setLayerOrder: (slideId: SlideId, orderedIds: LayerId[]) => void

  undo: () => void
  redo: () => void
  reset: (slides?: Slide[]) => void
  loadProject: (project: {
    id: string
    name: string
    canvas: CanvasDimensions
    aspectRatioId: string
    slides: Slide[]
  }) => void
  setSlideshowName: (name: string) => void
  markClean: () => void
  setStudioPanelTab: (tab: 'generate' | 'edit') => void
  getProjectPayload: () => {
    name: string
    canvas: CanvasDimensions
    aspectRatioId: string
    slides: Slide[]
  }
  clearProject: () => void
  setCanvas: (dimensions: CanvasDimensions) => void
  setAspectRatio: (id: string) => void
  setViewportZoom: (zoom: number) => void
  zoomViewportIn: () => void
  zoomViewportOut: () => void
  resetViewportZoom: () => void
  applyGeneratedContent: (texts: string[]) => void
  applyTikTokImport: (imageUrls: string[]) => void
}

type Snapshot = Pick<EditorState, 'slides' | 'activeSlideId' | 'activeLayerId'>

function takeSnapshot(state: EditorState): Snapshot {
  return {
    slides: state.slides.map(slide => ({
      ...slide,
      backgroundImageAdjustment: structuredClone(slide.backgroundImageAdjustment),
      backgroundImageFilters: [...slide.backgroundImageFilters],
      layers: slide.layers.map(cloneLayer),
    })),
    activeSlideId: state.activeSlideId,
    activeLayerId: state.activeLayerId,
  }
}

function withHistory<T extends EditorState>(set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void) {
  return (updater: (state: T) => Partial<T>) =>
    set((state: T) => {
      const snapshot = takeSnapshot(state as unknown as EditorState)
      const past = [...(state as unknown as EditorState).past, snapshot].slice(-HISTORY_LIMIT)
      const next = updater(state)
      return { ...next, past, future: [], isDirty: true } as Partial<T>
    })
}

function mutateSlide(slides: Slide[], slideId: SlideId, mutator: (slide: Slide) => Slide): Slide[] {
  return slides.map(slide => (slide.id === slideId ? mutator(slide) : slide))
}

function mutateLayer(slide: Slide, layerId: LayerId, mutator: (layer: SlideLayer) => SlideLayer): Slide {
  return { ...slide, layers: reindexLayers(slide.layers.map(l => (l.id === layerId ? mutator(l) : l))) }
}

function mutateImageLayer(
  slide: Slide,
  layerId: LayerId,
  mutator: (layer: ImageLayer) => ImageLayer,
): Slide {
  return {
    ...slide,
    layers: reindexLayers(
      slide.layers.map(l => (l.id === layerId && l.type === 'image' ? mutator(l) : l)),
    ),
  }
}

export const useEditorStore = create<EditorState>((set, get) => {
  const record = withHistory(set as never)

  const initialSlide = createSlide(0)
  return {
    canvas: DEFAULT_CANVAS,
    aspectRatioId: DEFAULT_ASPECT_RATIO_ID,
    viewportZoom: DEFAULT_VIEWPORT_ZOOM,
    slides: [initialSlide],
    activeSlideId: initialSlide.id,
    activeLayerId: null,
    past: [],
    future: [],
    slideshowId: null,
    slideshowName: 'Untitled slideshow',
    isDirty: false,
    lastSavedAt: null,
    studioPanelTab: 'generate',

    addSlide: backgroundImageUrl => {
      record(state => {
        const order = state.slides.length
        const slide = createSlide(order, backgroundImageUrl)
        return {
          slides: [...state.slides, slide],
          activeSlideId: slide.id,
          activeLayerId: null,
        }
      })
    },

    removeSlide: slideId => {
      record(state => {
        if (state.slides.length <= 1) return {}
        const remaining = state.slides
          .filter(s => s.id !== slideId)
          .map((s, i) => ({ ...s, order: i }))
        const activeSlideId =
          state.activeSlideId === slideId ? remaining[0]?.id ?? null : state.activeSlideId
        return { slides: remaining, activeSlideId, activeLayerId: null }
      })
    },

    duplicateSlide: slideId => {
      record(state => {
        const original = state.slides.find(s => s.id === slideId)
        if (!original) return {}
        const copy: Slide = {
          ...original,
          id: createSlideId(),
          layers: original.layers.map(cloneLayer),
          backgroundImageAdjustment: structuredClone(original.backgroundImageAdjustment),
          backgroundImageFilters: [...original.backgroundImageFilters],
        }
        const insertAt = state.slides.indexOf(original) + 1
        const slides = [...state.slides]
        slides.splice(insertAt, 0, copy)
        return {
          slides: slides.map((s, i) => ({ ...s, order: i })),
          activeSlideId: copy.id,
          activeLayerId: null,
        }
      })
    },

    reorderSlides: (sourceId, targetId) => {
      if (sourceId === targetId) return
      record(state => {
        const source = state.slides.find(s => s.id === sourceId)
        const target = state.slides.find(s => s.id === targetId)
        if (!source || !target) return {}
        const reordered = [...state.slides]
        reordered.splice(state.slides.indexOf(source), 1)
        reordered.splice(state.slides.indexOf(target), 0, source)
        return { slides: reordered.map((s, i) => ({ ...s, order: i })) }
      })
    },

    setSlideOrder: orderedIds => {
      record(state => {
        const byId = new Map(state.slides.map(slide => [slide.id, slide]))
        const slides = orderedIds
          .map(id => byId.get(id))
          .filter((slide): slide is Slide => slide != null)
        if (slides.length !== state.slides.length) return {}
        return { slides: slides.map((slide, index) => ({ ...slide, order: index })) }
      })
    },

    setActiveSlide: slideId => set({ activeSlideId: slideId, activeLayerId: null }),

    setSlideBackground: (slideId, imageUrl) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageUrl: imageUrl,
          backgroundImageAdjustment: DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT,
          backgroundImageFilters: [],
        })),
      }))
    },

    setSlideBackgroundColor: (slideId, color) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({ ...slide, backgroundColor: color })),
      }))
    },

    setSlideBackgroundImageAdjustment: (slideId, adjustment) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageAdjustment: adjustment,
        })),
      }))
    },

    setSlideBackgroundFilter: (slideId, filter) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageFilters: [
            ...slide.backgroundImageFilters.filter(item => item.type !== filter.type),
            filter,
          ],
        })),
      }))
    },

    removeSlideBackgroundFilter: (slideId, filterType) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageFilters: slide.backgroundImageFilters.filter(item => item.type !== filterType),
        })),
      }))
    },

    setSlideBackgroundFilterLive: (slideId, filter) =>
      set(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageFilters: [
            ...slide.backgroundImageFilters.filter(item => item.type !== filter.type),
            filter,
          ],
        })),
      })),

    removeSlideBackgroundFilterLive: (slideId, filterType) =>
      set(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageFilters: slide.backgroundImageFilters.filter(item => item.type !== filterType),
        })),
      })),

    clearSlideBackgroundImage: slideId => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          backgroundImageUrl: '',
          backgroundImageAdjustment: DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT,
          backgroundImageFilters: [],
        })),
      }))
    },

    addTextLayer: slideId => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => {
          const zIndex = slide.layers.length
          const layer = createTextLayer({ zIndex })
          return { ...slide, layers: [...slide.layers, layer] }
        }),
      }))
      const slide = get().slides.find(s => s.id === slideId)
      const top = slide ? sortLayers(slide.layers).at(-1) : undefined
      if (top) set({ activeSlideId: slideId, activeLayerId: top.id })
    },

    addImageLayer: (slideId, imageUrl = '') => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => {
          const zIndex = slide.layers.length
          const layer = createImageLayer({ zIndex, imageUrl })
          return { ...slide, layers: [...slide.layers, layer] }
        }),
      }))
      const slide = get().slides.find(s => s.id === slideId)
      const top = slide ? sortLayers(slide.layers).at(-1) : undefined
      if (top) set({ activeSlideId: slideId, activeLayerId: top.id })
    },

    updateLayer: (slideId, layerId, partial) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateLayer(slide, layerId, layer => ({ ...layer, ...partial }) as SlideLayer),
        ),
      }))
    },

    updateLayerStyle: (slideId, layerId, style) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateLayer(slide, layerId, layer => {
            if (layer.type !== 'text') return layer
            return { ...layer, style: { ...layer.style, ...style } }
          }),
        ),
      }))
    },

    setLayerImageUrl: (slideId, layerId, imageUrl) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateLayer(slide, layerId, layer => {
            if (layer.type !== 'image') return layer
            return { ...layer, imageUrl }
          }),
        ),
      }))
    },

    setImageLayerFilter: (slideId, layerId, filter) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateImageLayer(slide, layerId, layer => ({
            ...layer,
            filters: [...layer.filters.filter(item => item.type !== filter.type), filter],
          })),
        ),
      }))
    },

    removeImageLayerFilter: (slideId, layerId, filterType) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateImageLayer(slide, layerId, layer => ({
            ...layer,
            filters: layer.filters.filter(item => item.type !== filterType),
          })),
        ),
      }))
    },

    setImageLayerFilterLive: (slideId, layerId, filter) =>
      set(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateImageLayer(slide, layerId, layer => ({
            ...layer,
            filters: [...layer.filters.filter(item => item.type !== filter.type), filter],
          })),
        ),
      })),

    removeImageLayerFilterLive: (slideId, layerId, filterType) =>
      set(state => ({
        slides: mutateSlide(state.slides, slideId, slide =>
          mutateImageLayer(slide, layerId, layer => ({
            ...layer,
            filters: layer.filters.filter(item => item.type !== filterType),
          })),
        ),
      })),

    promoteImageLayerToBackground: (slideId, layerId) => {
      const state = get()
      const slide = state.slides.find(s => s.id === slideId)
      const layer = slide?.layers.find(l => l.id === layerId)
      if (!layer || layer.type !== 'image' || !layer.imageUrl) return

      record(s => ({
        slides: mutateSlide(s.slides, slideId, current => ({
          ...current,
          backgroundImageUrl: layer.imageUrl,
          backgroundImageAdjustment: DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT,
          backgroundImageFilters: [],
          layers: reindexLayers(current.layers.filter(l => l.id !== layerId)),
        })),
        activeLayerId: s.activeLayerId === layerId ? null : s.activeLayerId,
      }))
    },

    removeLayer: (slideId, layerId) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => ({
          ...slide,
          layers: reindexLayers(slide.layers.filter(l => l.id !== layerId)),
        })),
        activeLayerId: state.activeLayerId === layerId ? null : state.activeLayerId,
      }))
    },

    duplicateLayer: (slideId, layerId) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => {
          const original = slide.layers.find(l => l.id === layerId)
          if (!original) return slide
          const copy = cloneLayer(original)
          const duplicated: SlideLayer = {
            ...copy,
            id: createLayerId(),
            x: Math.min(original.x + 4, 90),
            y: Math.min(original.y + 4, 88),
          }
          return { ...slide, layers: reindexLayers([...slide.layers, duplicated]) }
        }),
      }))
      const state = get()
      const slide = state.slides.find(s => s.id === slideId)
      if (slide) {
        const top = sortLayers(slide.layers).at(-1)
        if (top) set({ activeLayerId: top.id })
      }
    },

    setActiveLayer: (slideId, layerId) => set({ activeSlideId: slideId, activeLayerId: layerId }),

    clearLayerSelection: () => set({ activeLayerId: null }),

    bringForward: (slideId, layerId) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => {
          const sorted = sortLayers(slide.layers)
          const idx = sorted.findIndex(l => l.id === layerId)
          if (idx < 0 || idx >= sorted.length - 1) return slide
          const reordered = sorted.slice()
          ;[reordered[idx], reordered[idx + 1]] = [reordered[idx + 1]!, reordered[idx]!]
          return { ...slide, layers: reindexLayers(reordered) }
        }),
      }))
    },

    sendBackward: (slideId, layerId) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => {
          const sorted = sortLayers(slide.layers)
          const idx = sorted.findIndex(l => l.id === layerId)
          if (idx <= 0) return slide
          const reordered = sorted.slice()
          ;[reordered[idx - 1], reordered[idx]] = [reordered[idx]!, reordered[idx - 1]!]
          return { ...slide, layers: reindexLayers(reordered) }
        }),
      }))
    },

    setLayerOrder: (slideId, orderedIds) => {
      record(state => ({
        slides: mutateSlide(state.slides, slideId, slide => {
          const byId = new Map(slide.layers.map(layer => [layer.id, layer]))
          const layers = orderedIds
            .slice()
            .reverse()
            .map(id => byId.get(id))
            .filter((layer): layer is SlideLayer => layer != null)
          if (layers.length !== slide.layers.length) return slide
          return { ...slide, layers: reindexLayers(layers) }
        }),
      }))
    },

    undo: () => {
      set(state => {
        if (state.past.length === 0) return {}
        const previous = state.past[state.past.length - 1]
        const current = takeSnapshot(state)
        return {
          ...previous,
          past: state.past.slice(0, -1),
          future: [current, ...state.future].slice(0, HISTORY_LIMIT),
        }
      })
    },

    redo: () => {
      set(state => {
        if (state.future.length === 0) return {}
        const next = state.future[0]
        const current = takeSnapshot(state)
        return {
          ...next,
          past: [...state.past, current].slice(-HISTORY_LIMIT),
          future: state.future.slice(1),
        }
      })
    },

    reset: slides => {
      const initial = slides && slides.length > 0 ? slides : [createSlide(0)]
      set({
        slides: initial.map((s, i) => normalizeSlide({ ...s, order: i })),
        activeSlideId: initial[0].id,
        activeLayerId: null,
        past: [],
        future: [],
        isDirty: false,
        lastSavedAt: null,
        studioPanelTab: 'generate',
      })
    },

    loadProject: project => {
      const slides = project.slides.length > 0 ? project.slides : [createSlide(0)]
      set({
        slideshowId: project.id,
        slideshowName: project.name,
        canvas: project.canvas,
        aspectRatioId: project.aspectRatioId,
        slides: slides.map((slide, index) => normalizeSlide({ ...slide, order: index })),
        activeSlideId: slides[0]?.id ?? null,
        activeLayerId: null,
        past: [],
        future: [],
        isDirty: false,
        lastSavedAt: Date.now(),
        studioPanelTab: 'edit',
      })
    },

    setSlideshowName: name => set(state => (state.slideshowName === name ? {} : { slideshowName: name, isDirty: true })),

    markClean: () => set({ isDirty: false, lastSavedAt: Date.now() }),

    setStudioPanelTab: tab => set({ studioPanelTab: tab }),

    getProjectPayload: () => {
      const state = get()
      return {
        name: state.slideshowName,
        canvas: state.canvas,
        aspectRatioId: state.aspectRatioId,
        slides: state.slides.map(normalizeSlide),
      }
    },

    clearProject: () => {
      const initialSlide = createSlide(0)
      set({
        slideshowId: null,
        slideshowName: 'Untitled slideshow',
        canvas: DEFAULT_CANVAS,
        aspectRatioId: DEFAULT_ASPECT_RATIO_ID,
        viewportZoom: DEFAULT_VIEWPORT_ZOOM,
        slides: [initialSlide],
        activeSlideId: initialSlide.id,
        activeLayerId: null,
        past: [],
        future: [],
        isDirty: false,
        lastSavedAt: null,
        studioPanelTab: 'generate',
      })
    },

    setCanvas: dimensions =>
      set({
        canvas: dimensions,
        aspectRatioId: findAspectRatioId(dimensions),
        isDirty: true,
      }),

    setAspectRatio: id => {
      const preset = getAspectRatioPreset(id)
      set(state =>
        state.aspectRatioId === id
          ? {}
          : {
              aspectRatioId: id,
              canvas: preset.dimensions,
              viewportZoom: DEFAULT_VIEWPORT_ZOOM,
              isDirty: true,
            },
      )
    },

    setViewportZoom: zoom =>
      set({ viewportZoom: Math.min(MAX_VIEWPORT_ZOOM, Math.max(MIN_VIEWPORT_ZOOM, zoom)) }),

    zoomViewportIn: () =>
      set(state => ({
        viewportZoom: Math.min(
          MAX_VIEWPORT_ZOOM,
          Math.round((state.viewportZoom + VIEWPORT_ZOOM_STEP) * 100) / 100,
        ),
      })),

    zoomViewportOut: () =>
      set(state => ({
        viewportZoom: Math.max(
          MIN_VIEWPORT_ZOOM,
          Math.round((state.viewportZoom - VIEWPORT_ZOOM_STEP) * 100) / 100,
        ),
      })),

    resetViewportZoom: () => set({ viewportZoom: DEFAULT_VIEWPORT_ZOOM }),

    applyGeneratedContent: texts => {
      if (texts.length === 0) return
      record(state => {
        const slides = mergeGeneratedTextsIntoSlides(state.slides, texts)
        const activeSlide = slides[0]
        const activeLayer = activeSlide ? sortLayers(activeSlide.layers)[0] : undefined
        return {
          slides,
          activeSlideId: activeSlide?.id ?? null,
          activeLayerId: activeLayer?.id ?? null,
        }
      })
    },

    applyTikTokImport: imageUrls => {
      if (imageUrls.length === 0) return
      const tiktokCanvas = getAspectRatioPreset('tiktok').dimensions
      const slides = imageUrls.map((imageUrl, order) => createSlide(order, proxiedImageUrl(imageUrl)))
      set({
        aspectRatioId: 'tiktok',
        canvas: tiktokCanvas,
        viewportZoom: DEFAULT_VIEWPORT_ZOOM,
        slides,
        activeSlideId: slides[0].id,
        activeLayerId: null,
        past: [],
        future: [],
        isDirty: true,
      })
    },
  }
})
