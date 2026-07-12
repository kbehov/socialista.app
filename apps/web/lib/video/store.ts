import { create } from 'zustand'
import type {
  CanvasDimensions,
  Clip,
  ClipId,
  ClipTransform,
  ExportSettings,
  Project,
  SerializedMediaAsset,
  TextOverlay,
  Track,
  TrackId,
  Transition,
  VideoFilter,
} from '@socialista/types'

import {
  clamp,
  clampZoom,
  computeProjectDuration,
  createClip,
  createEntityId,
  createProject,
  createTextOverlay,
  createTrack,
  DEFAULT_PROJECT_NAME,
  DEFAULT_RESOLUTION,
  DEFAULT_TEXT_OVERLAY_TRANSFORM,
  DEFAULT_ZOOM,
  DEFAULT_IMAGE_CLIP_DURATION,
  getClipSourceDuration,
  withClipSpeed,
  HISTORY_LIMIT,
  MAX_CLIP_SPEED,
  MIN_CLIP_SPEED,
  OVERLAY_ANCHOR_PRESETS,
  snapToZoomLevel,
  toSerializedAsset,
  type OverlayAnchor,
  withClipMoved,
  withClipOnTrack,
  withClipReordered,
} from './defaults'
import {
  DEFAULT_VIDEO_FORMAT_PRESET_ID,
  getVideoFormatPreset,
  resolveVideoFormatPresetId,
  type VideoFormatPresetId,
} from './format-presets'
import type { MediaAsset } from './types'
import { isMediaAssetAvailable } from './types'
import { frameAtTime, timeAtFrame } from './timecode'

type AssetMap = Record<string, MediaAsset | SerializedMediaAsset>

interface Snapshot {
  project: Project
  selectedClipId: ClipId | null
  selectedOverlayId: string | null
}

interface EditorState {
  project: Project
  /** Runtime media assets (with File/objectUrl) keyed by id; merged with project.assets on save. */
  assets: AssetMap
  playhead: number
  isPlaying: boolean
  selectedClipId: ClipId | null
  selectedOverlayId: string | null
  zoom: number
  ffmpegReady: boolean
  exportProgress: number | null
  exportPhase: string | null
  /** Visual-only duration marker on timeline ruler (seconds). */
  durationGuide: number | null
  past: Snapshot[]
  future: Snapshot[]
  /** Selected export preset (e.g. tiktok vs instagram-story at the same resolution). */
  formatPresetId: VideoFormatPresetId

  // Project / tracks
  loadProject: (input: { id: string; name: string; project: Project }) => void
  setProjectName: (name: string) => void
  setResolution: (resolution: CanvasDimensions) => void
  setFormatPreset: (presetId: VideoFormatPresetId) => void
  setFps: (fps: number) => void
  setDurationGuide: (seconds: number | null) => void
  addTrack: (type: 'video' | 'audio') => void
  removeTrack: (trackId: TrackId) => void
  reorderTrack: (sourceId: TrackId, targetId: TrackId) => void
  toggleMute: (trackId: TrackId) => void
  toggleLock: (trackId: TrackId) => void

  // Assets
  registerAsset: (asset: MediaAsset) => void
  relinkAsset: (assetId: string, file: File, hash: string) => void
  removeAsset: (assetId: string) => void
  /** Attach runtime media loaded from persisted URLs without duplicating project.assets. */
  hydrateRuntimeAssets: (assets: MediaAsset[]) => void
  /** Sync persisted asset metadata after upload on save. */
  applyPersistedAssets: (assets: SerializedMediaAsset[]) => void

  // Clips
  addClip: (assetId: string, trackId: TrackId, startTime: number, duration?: number) => ClipId | null
  moveClip: (clipId: ClipId, newStartTime: number, newTrackId: TrackId) => void
  trimClip: (clipId: ClipId, trimIn: number, trimOut: number) => void
  splitClip: (clipId: ClipId, atTime: number) => void
  removeClip: (clipId: ClipId) => void
  setClipVolume: (clipId: ClipId, volume: number) => void
  setClipSpeed: (clipId: ClipId, speed: number) => void
  setClipFilter: (clipId: ClipId, filter: VideoFilter) => void
  removeClipFilter: (clipId: ClipId, filterType: VideoFilter['type']) => void
  setClipTransition: (clipId: ClipId, transition: Transition) => void
  /** Live preview updates without undo history (commit with the matching setter on release). */
  setClipVolumeLive: (clipId: ClipId, volume: number) => void
  setClipSpeedLive: (clipId: ClipId, speed: number) => void
  setClipFilterLive: (clipId: ClipId, filter: VideoFilter) => void
  removeClipFilterLive: (clipId: ClipId, filterType: VideoFilter['type']) => void
  trimClipLive: (clipId: ClipId, trimIn: number, trimOut: number) => void
  duplicateClip: (clipId: ClipId) => void
  replaceClipAsset: (clipId: ClipId, newAssetId: string) => void
  /** Register a generated asset and swap it onto an existing clip in one undo step. */
  applyClipAiResult: (clipId: ClipId, asset: MediaAsset) => void
  updateClipTransform: (clipId: ClipId, partial: Partial<ClipTransform>) => void
  updateClipTransformLive: (clipId: ClipId, partial: Partial<ClipTransform>) => void
  resetClipTransform: (clipId: ClipId) => void
  selectClip: (clipId: ClipId | null) => void

  // Text overlays
  addTextOverlay: (startTime: number, endTime: number) => string
  updateOverlay: (id: string, partial: Partial<TextOverlay>) => void
  /** Live preview update without undo history (e.g. while typing). */
  updateOverlayLive: (id: string, partial: Partial<TextOverlay>) => void
  updateOverlayStyle: (id: string, style: Partial<TextOverlay['style']>) => void
  setOverlayTiming: (id: string, startTime: number, endTime: number) => void
  splitOverlay: (id: string, atTime: number) => void
  removeOverlay: (id: string) => void
  duplicateOverlay: (id: string) => void
  resetOverlayTransform: (id: string) => void
  anchorOverlay: (id: string, anchor: OverlayAnchor) => void
  bringOverlayToFront: (id: string) => void
  sendOverlayToBack: (id: string) => void
  reorderOverlay: (id: string, direction: 1 | -1) => void
  selectOverlay: (id: string | null) => void

  // Playback
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void

  // History
  undo: () => void
  redo: () => void

  // Export
  setFfmpegReady: (ready: boolean) => void
  setExportProgress: (progress: number | null, phase?: string | null) => void
  exportVideo: (settings: ExportSettings, runner: (project: Project, assets: AssetMap, settings: ExportSettings) => Promise<void>) => Promise<void>

  // Project lifecycle
  clearProject: () => void
  getProjectPayload: () => {
    name: string
    resolution: CanvasDimensions
    fps: number
    duration: number
    tracks: Track[]
    clips: Record<ClipId, Clip>
    textOverlays: TextOverlay[]
    assets: SerializedMediaAsset[]
  }
}

function takeSnapshot(state: EditorState): Snapshot {
  return {
    project: structuredClone(state.project),
    selectedClipId: state.selectedClipId,
    selectedOverlayId: state.selectedOverlayId,
  }
}

function withHistory<T extends EditorState>(set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void) {
  return (updater: (state: T) => Partial<T>) =>
    set((state: T) => {
      const snapshot = takeSnapshot(state as unknown as EditorState)
      const past = [...(state as unknown as EditorState).past, snapshot].slice(-HISTORY_LIMIT)
      const next = updater(state)
      return { ...next, past, future: [] } as Partial<T>
    })
}

function mutateClip(project: Project, clipId: ClipId, mutator: (clip: Clip) => Clip): Project {
  const clip = project.clips[clipId]
  if (!clip) return project
  return { ...project, clips: { ...project.clips, [clipId]: mutator(clip) } }
}

function mutateTrack(project: Project, trackId: TrackId, mutator: (track: Track) => Track): Project {
  return {
    ...project,
    tracks: project.tracks.map(track => (track.id === trackId ? mutator(track) : track)),
  }
}

function recomputeDuration(project: Project): Project {
  return { ...project, duration: computeProjectDuration(project) }
}

/**
 * Ripple shift: move every clip on the track whose start is at or past
 * `afterTime` (except the source clip) by `deltaSec`. Used after a trim to
 * keep adjacent clips touching the trimmed clip's edge instead of leaving a
 * gap or pushing into a neighbour.
 */
function shiftSubsequentClips(
  project: Project,
  trackId: TrackId,
  sourceClipId: ClipId,
  afterTime: number,
  deltaSec: number,
): Project {
  if (deltaSec === 0) return project
  const track = project.tracks.find(t => t.id === trackId)
  if (!track) return project
  const clips = { ...project.clips }
  for (const id of track.clips) {
    if (id === sourceClipId) continue
    const c = clips[id]
    if (!c) continue
    if (c.startTime >= afterTime) {
      const nextStart = Math.max(0, c.startTime + deltaSec)
      clips[id] = { ...c, startTime: nextStart }
    }
  }
  return recomputeDuration({ ...project, clips })
}

/**
 * Clamp a clip's desired start time for a cross-track move. Same-track moves
 * use {@link withClipReordered} instead, which can reorder past neighbours.
 */
function clampCrossTrackStart(
  project: Project,
  trackId: TrackId,
  clipId: ClipId,
  desiredStart: number,
  duration: number,
): number | null {
  const candidate = Math.max(0, desiredStart)
  if (wouldOverlap(project, trackId, candidate, duration, clipId)) return null
  return candidate
}

function applySpeedChange(
  project: Project,
  assets: AssetMap,
  clipId: ClipId,
  speed: number,
): Project | null {
  const clip = project.clips[clipId]
  if (!clip || clip.type === 'audio') return null

  const oldSpeed = clip.speed ?? 1
  const newSpeed = clamp(speed, MIN_CLIP_SPEED, MAX_CLIP_SPEED)
  if (newSpeed === oldSpeed) return project

  const asset = assets[clip.assetId]
  const sourceDuration = getClipSourceDuration(clip, asset)
  const updated = withClipSpeed(clip, sourceDuration, newSpeed)
  const oldEnd = clip.startTime + clip.duration
  const deltaSec = updated.duration - clip.duration
  const clips = { ...project.clips, [clipId]: updated }
  const withDuration = recomputeDuration({ ...project, clips })
  return shiftSubsequentClips(withDuration, clip.trackId, clipId, oldEnd, deltaSec)
}

function applyTrim(
  project: Project,
  assets: AssetMap,
  clipId: ClipId,
  trimIn: number,
  trimOut: number,
): Project | null {
  const clip = project.clips[clipId]
  if (!clip) return null
  const asset = assets[clip.assetId]
  const sourceDuration = getClipSourceDuration(clip, asset)
  const safeTrimIn = Math.max(0, trimIn)
  const safeTrimOut = Math.max(0, trimOut)
  const newDuration = Math.max(0.1, sourceDuration - safeTrimIn - safeTrimOut)
  const updated: Clip = { ...clip, trimIn: safeTrimIn, trimOut: safeTrimOut, duration: newDuration }
  const oldEnd = clip.startTime + clip.duration
  const deltaSec = newDuration - clip.duration
  const clips = { ...project.clips, [clipId]: updated }
  const trimmed = recomputeDuration({ ...project, clips })
  return shiftSubsequentClips(trimmed, clip.trackId, clipId, oldEnd, deltaSec)
}

function snapSeekTime(time: number, fps: number, maxDuration: number): number {
  const snapped = timeAtFrame(frameAtTime(time, fps), fps)
  return Math.max(0, Math.min(snapped, maxDuration))
}

/** Reject move/trim if it would overlap another clip on the same track. */
function wouldOverlap(project: Project, trackId: TrackId, startTime: number, duration: number, ignoreClipId: ClipId): boolean {
  const track = project.tracks.find(t => t.id === trackId)
  if (!track) return false
  const end = startTime + duration
  for (const id of track.clips) {
    if (id === ignoreClipId) continue
    const other = project.clips[id]
    if (!other) continue
    const otherEnd = other.startTime + other.duration
    if (startTime < otherEnd && end > other.startTime) return true
  }
  return false
}

function resolveClipFromAsset(clip: Clip, asset: MediaAsset): Pick<Clip, 'type' | 'duration'> {
  const clipType = asset.type === 'image' ? 'image' : 'video'
  const duration =
    asset.type === 'image'
      ? clip.type === 'image'
        ? clip.duration
        : DEFAULT_IMAGE_CLIP_DURATION
      : asset.duration > 0
        ? asset.duration
        : clip.duration

  return { type: clipType, duration }
}

export const useVideoEditorStore = create<EditorState>((set, get) => {
  const record = withHistory(set as never)
  const initialProject = createProject()

  return {
    project: initialProject,
    assets: {},
    playhead: 0,
    isPlaying: false,
    selectedClipId: null,
    selectedOverlayId: null,
    zoom: DEFAULT_ZOOM,
    ffmpegReady: false,
    exportProgress: null,
    exportPhase: null,
    durationGuide: null,
    past: [],
    future: [],
    formatPresetId: DEFAULT_VIDEO_FORMAT_PRESET_ID,

    loadProject: ({ id, name, project }) => {
      set({
        project: { ...project, id, name },
        assets: {},
        playhead: 0,
        isPlaying: false,
        selectedClipId: null,
        selectedOverlayId: null,
        past: [],
        future: [],
        formatPresetId: resolveVideoFormatPresetId(project.resolution),
      })
    },

    setProjectName: name => set(state => ({ project: { ...state.project, name } })),

    setResolution: resolution =>
      set(state => ({
        project: { ...state.project, resolution },
        formatPresetId: resolveVideoFormatPresetId(resolution, state.formatPresetId),
      })),

    setFormatPreset: presetId => {
      const preset = getVideoFormatPreset(presetId)
      if (!preset) return
      set(state => ({
        project: { ...state.project, resolution: { ...preset.dimensions } },
        formatPresetId: presetId,
      }))
    },

    setFps: fps => set(state => ({ project: { ...state.project, fps } })),

    setDurationGuide: seconds => set({ durationGuide: seconds }),

    addTrack: type => {
      record(state => ({
        project: { ...state.project, tracks: [...state.project.tracks, createTrack(type)] },
      }))
    },

    removeTrack: trackId => {
      record(state => {
        const track = state.project.tracks.find(t => t.id === trackId)
        if (!track) return {}
        const clips = { ...state.project.clips }
        for (const clipId of track.clips) {
          delete clips[clipId]
        }
        return {
          project: {
            ...state.project,
            tracks: state.project.tracks.filter(t => t.id !== trackId),
            clips,
          },
          selectedClipId: state.selectedClipId && track.clips.includes(state.selectedClipId) ? null : state.selectedClipId,
        }
      })
    },

    reorderTrack: (sourceId, targetId) => {
      if (sourceId === targetId) return
      record(state => {
        const tracks = [...state.project.tracks]
        const sourceIdx = tracks.findIndex(t => t.id === sourceId)
        const targetIdx = tracks.findIndex(t => t.id === targetId)
        if (sourceIdx === -1 || targetIdx === -1) return {}
        const [moved] = tracks.splice(sourceIdx, 1)
        if (!moved) return {}
        tracks.splice(targetIdx, 0, moved)
        return { project: { ...state.project, tracks } }
      })
    },

    toggleMute: trackId => {
      record(state => ({
        project: mutateTrack(state.project, trackId, track => ({ ...track, muted: !track.muted })),
      }))
    },

    toggleLock: trackId => {
      record(state => ({
        project: mutateTrack(state.project, trackId, track => ({ ...track, locked: !track.locked })),
      }))
    },

    registerAsset: asset => {
      set(state => ({
        assets: { ...state.assets, [asset.id]: asset },
        project: {
          ...state.project,
          assets: [...state.project.assets, toSerializedAsset(asset)],
        },
      }))
    },

    relinkAsset: (assetId, file, hash) => {
      set(state => {
        const existing = state.assets[assetId]
        if (!existing) return {}
        const objectUrl = URL.createObjectURL(file)
        const base: SerializedMediaAsset = {
          id: existing.id,
          name: existing.name,
          type: existing.type,
          hash,
          duration: existing.duration,
          width: existing.width,
          height: existing.height,
        }
        const updated: MediaAsset = {
          ...base,
          file,
          objectUrl,
          thumbnails: isMediaAssetAvailable(existing) ? existing.thumbnails : undefined,
          waveform: isMediaAssetAvailable(existing) ? existing.waveform : undefined,
        }
        return {
          assets: { ...state.assets, [assetId]: updated },
          project: {
            ...state.project,
            assets: state.project.assets.map(a => (a.id === assetId ? base : a)),
          },
        }
      })
    },

    removeAsset: assetId => {
      record(state => {
        const asset = state.assets[assetId]
        if (asset && isMediaAssetAvailable(asset)) {
          URL.revokeObjectURL(asset.objectUrl)
        }
        const newAssets = { ...state.assets }
        delete newAssets[assetId]
        // Remove all clips referencing this asset
        const remainingClips: Record<ClipId, Clip> = {}
        for (const [id, clip] of Object.entries(state.project.clips)) {
          if (clip.assetId !== assetId) {
            remainingClips[id] = clip
          }
        }
        const tracks = state.project.tracks.map(track => ({
          ...track,
          clips: track.clips.filter(id => state.project.clips[id]?.assetId !== assetId),
        }))
        return {
          assets: newAssets,
          project: {
            ...state.project,
            assets: state.project.assets.filter(a => a.id !== assetId),
            clips: remainingClips,
            tracks,
          },
        }
      })
    },

    hydrateRuntimeAssets: assetsToHydrate => {
      if (assetsToHydrate.length === 0) return
      set(state => {
        const nextAssets = { ...state.assets }
        for (const asset of assetsToHydrate) {
          nextAssets[asset.id] = asset
        }
        return { assets: nextAssets }
      })
    },

    applyPersistedAssets: persistedAssets => {
      set(state => {
        const persistedById = new Map(persistedAssets.map(asset => [asset.id, asset]))
        const nextRuntimeAssets = { ...state.assets }

        for (const [id, asset] of Object.entries(nextRuntimeAssets)) {
          const persisted = persistedById.get(id)
          if (!persisted || !isMediaAssetAvailable(asset)) continue
          nextRuntimeAssets[id] = {
            ...asset,
            url: persisted.url,
            fileId: persisted.fileId,
          }
        }

        return {
          assets: nextRuntimeAssets,
          project: { ...state.project, assets: persistedAssets },
        }
      })
    },

    addClip: (assetId, trackId, startTime, duration) => {
      const asset = get().assets[assetId]
      if (!asset || !isMediaAssetAvailable(asset)) return null
      const track = get().project.tracks.find(t => t.id === trackId)
      if (!track) return null
      if (track.type !== (asset.type === 'audio' ? 'audio' : 'video')) return null
      const clip = createClip(asset, trackId, startTime, duration)
      if (wouldOverlap(get().project, trackId, clip.startTime, clip.duration, clip.id)) {
        return null
      }
      record(state => ({
        project: recomputeDuration(withClipOnTrack(state.project, clip, trackId)),
        selectedClipId: clip.id,
      }))
      return clip.id
    },

    moveClip: (clipId, newStartTime, newTrackId) => {
      record(state => {
        const clip = state.project.clips[clipId]
        if (!clip) return {}
        const targetTrack = state.project.tracks.find(t => t.id === newTrackId)
        if (!targetTrack || targetTrack.locked) return {}
        if (targetTrack.type !== (clip.type === 'audio' ? 'audio' : 'video')) return {}
        const desired = Math.max(0, newStartTime)
        if (newTrackId === clip.trackId) {
          if (desired === clip.startTime) return {}
          return { project: withClipReordered(state.project, clipId, desired) }
        }
        const finalStart = clampCrossTrackStart(
          state.project,
          newTrackId,
          clipId,
          desired,
          clip.duration,
        )
        if (finalStart === null) return {}
        return { project: recomputeDuration(withClipMoved(state.project, clipId, finalStart, newTrackId)) }
      })
    },

    trimClip: (clipId, trimIn, trimOut) => {
      record(state => {
        const next = applyTrim(state.project, state.assets, clipId, trimIn, trimOut)
        if (!next) return {}
        return { project: next }
      })
    },

    splitClip: (clipId, atTime) => {
      record(state => {
        const clip = state.project.clips[clipId]
        if (!clip) return {}
        const track = state.project.tracks.find(t => t.id === clip.trackId)
        if (!track || track.locked) return {}
        const localTime = atTime - clip.startTime
        if (localTime <= 0 || localTime >= clip.duration) return {}
        const asset = state.assets[clip.assetId]
        const sourceDuration = getClipSourceDuration(clip, asset)
        const firstDuration = localTime
        const secondDuration = clip.duration - localTime
        const secondTrimIn = clip.trimIn + localTime
        const first: Clip = {
          ...clip,
          duration: firstDuration,
          trimOut: Math.max(0, sourceDuration - clip.trimIn - firstDuration),
        }
        const second: Clip = {
          ...clip,
          id: createEntityId('clip'),
          startTime: clip.startTime + firstDuration,
          duration: secondDuration,
          trimIn: secondTrimIn,
          trimOut: Math.max(0, sourceDuration - secondTrimIn - secondDuration),
        }
        const clips = { ...state.project.clips, [clip.id]: first, [second.id]: second }
        return {
          project: recomputeDuration(withClipOnTrack({ ...state.project, clips }, second, track.id)),
          selectedClipId: second.id,
        }
      })
    },

    removeClip: clipId => {
      record(state => {
        const clip = state.project.clips[clipId]
        if (!clip) return {}
        const clips = { ...state.project.clips }
        delete clips[clipId]
        const tracks = state.project.tracks.map(t =>
          t.id === clip.trackId ? { ...t, clips: t.clips.filter(id => id !== clipId) } : t,
        )
        return {
          project: recomputeDuration({ ...state.project, clips, tracks }),
          selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
        }
      })
    },

    setClipVolume: (clipId, volume) => {
      record(state => ({
        project: mutateClip(state.project, clipId, clip => ({ ...clip, volume: clamp(volume, 0, 1) })),
      }))
    },

    setClipSpeed: (clipId, speed) => {
      record(state => {
        const next = applySpeedChange(state.project, state.assets, clipId, speed)
        if (!next) return {}
        return { project: next }
      })
    },

    setClipFilter: (clipId, filter) => {
      record(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          return {
            ...clip,
            filters: [...clip.filters.filter(f => f.type !== filter.type), filter],
          }
        }),
      }))
    },

    removeClipFilter: (clipId, filterType) => {
      record(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          return { ...clip, filters: clip.filters.filter(f => f.type !== filterType) }
        }),
      }))
    },

    setClipTransition: (clipId, transition) => {
      record(state => ({
        project: mutateClip(state.project, clipId, clip =>
          clip.type === 'audio' ? clip : { ...clip, transition },
        ),
      }))
    },

    setClipVolumeLive: (clipId, volume) =>
      set(state => ({
        project: mutateClip(state.project, clipId, clip => ({ ...clip, volume: clamp(volume, 0, 1) })),
      })),

    setClipSpeedLive: (clipId, speed) =>
      set(state => {
        const next = applySpeedChange(state.project, state.assets, clipId, speed)
        if (!next) return {}
        return { project: next }
      }),

    setClipFilterLive: (clipId, filter) =>
      set(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          return {
            ...clip,
            filters: [...clip.filters.filter(f => f.type !== filter.type), filter],
          }
        }),
      })),

    removeClipFilterLive: (clipId, filterType) =>
      set(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          return { ...clip, filters: clip.filters.filter(f => f.type !== filterType) }
        }),
      })),

    trimClipLive: (clipId, trimIn, trimOut) =>
      set(state => {
        const next = applyTrim(state.project, state.assets, clipId, trimIn, trimOut)
        if (!next) return {}
        return { project: next }
      }),

    duplicateClip: clipId => {
      record(state => {
        const clip = state.project.clips[clipId]
        if (!clip) return {}
        const track = state.project.tracks.find(t => t.id === clip.trackId)
        if (!track) return {}
        const newStart = clip.startTime + clip.duration
        if (wouldOverlap(state.project, clip.trackId, newStart, clip.duration, clipId)) return {}
        const copy: Clip = { ...clip, id: createEntityId('clip'), startTime: newStart }
        return {
          project: recomputeDuration(withClipOnTrack(state.project, copy, track.id)),
          selectedClipId: copy.id,
        }
      })
    },

    replaceClipAsset: (clipId, newAssetId) => {
      record(state => {
        const clip = state.project.clips[clipId]
        const asset = state.assets[newAssetId]
        if (!clip || clip.type === 'audio' || !asset || !isMediaAssetAvailable(asset) || asset.type === 'audio') {
          return {}
        }

        const { type: clipType, duration } = resolveClipFromAsset(clip, asset)

        const updated: Clip = {
          ...clip,
          type: clipType,
          assetId: newAssetId,
          trimIn: 0,
          trimOut: 0,
          duration,
        }

        return {
          project: recomputeDuration({
            ...state.project,
            clips: { ...state.project.clips, [clipId]: updated },
          }),
        }
      })
    },

    applyClipAiResult: (clipId, asset) => {
      record(state => {
        const clip = state.project.clips[clipId]
        if (!clip || clip.type === 'audio' || asset.type === 'audio' || !isMediaAssetAvailable(asset)) {
          return {}
        }

        const { type: clipType, duration } = resolveClipFromAsset(clip, asset)

        const updated: Clip = {
          ...clip,
          type: clipType,
          assetId: asset.id,
          trimIn: 0,
          trimOut: 0,
          duration,
        }

        const serialized = toSerializedAsset(asset)
        const hasAsset = state.project.assets.some(a => a.id === asset.id)

        return {
          assets: { ...state.assets, [asset.id]: asset },
          project: recomputeDuration({
            ...state.project,
            assets: hasAsset ? state.project.assets : [...state.project.assets, serialized],
            clips: { ...state.project.clips, [clipId]: updated },
          }),
        }
      })
    },

    selectClip: clipId => set({ selectedClipId: clipId, selectedOverlayId: null }),

    updateClipTransform: (clipId, partial) => {
      record(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          const base = clip.transform ?? { x: 0, y: 0, width: 100, rotation: 0 }
          return { ...clip, transform: { ...base, ...partial } }
        }),
      }))
    },

    updateClipTransformLive: (clipId, partial) => {
      set(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          const base = clip.transform ?? { x: 0, y: 0, width: 100, rotation: 0 }
          return { ...clip, transform: { ...base, ...partial } }
        }),
      }))
    },

    resetClipTransform: clipId => {
      record(state => ({
        project: mutateClip(state.project, clipId, clip => {
          if (clip.type === 'audio') return clip
          const { transform: _removed, ...rest } = clip
          return rest
        }),
      }))
    },

    addTextOverlay: (startTime, endTime) => {
      const maxZ = get().project.textOverlays.reduce((m, o) => Math.max(m, o.zIndex), -1)
      const overlay = createTextOverlay(startTime, endTime, maxZ + 1)
      record(state => ({
        project: recomputeDuration({
          ...state.project,
          textOverlays: [...state.project.textOverlays, overlay],
        }),
      }))
      set({ selectedOverlayId: overlay.id, selectedClipId: null })
      return overlay.id
    },

    updateOverlay: (id, partial) => {
      record(state => ({
        project: recomputeDuration({
          ...state.project,
          textOverlays: state.project.textOverlays.map(o => (o.id === id ? { ...o, ...partial } : o)),
        }),
      }))
    },

    updateOverlayLive: (id, partial) => {
      set(state => ({
        project: {
          ...state.project,
          textOverlays: state.project.textOverlays.map(o => (o.id === id ? { ...o, ...partial } : o)),
        },
      }))
    },

    setOverlayTiming: (id, startTime, endTime) => {
      const safeStart = Math.max(0, startTime)
      const safeEnd = Math.max(safeStart + 0.1, endTime)
      record(state => ({
        project: recomputeDuration({
          ...state.project,
          textOverlays: state.project.textOverlays.map(o =>
            o.id === id ? { ...o, startTime: safeStart, endTime: safeEnd } : o,
          ),
        }),
      }))
    },

    splitOverlay: (id, atTime) => {
      record(state => {
        const overlay = state.project.textOverlays.find(o => o.id === id)
        if (!overlay) return {}
        if (atTime <= overlay.startTime + 0.05 || atTime >= overlay.endTime - 0.05) return {}
        const second: TextOverlay = {
          ...overlay,
          id: createEntityId('overlay'),
          startTime: atTime,
        }
        const first: TextOverlay = { ...overlay, endTime: atTime }
        return {
          project: recomputeDuration({
            ...state.project,
            textOverlays: state.project.textOverlays.flatMap(o => {
              if (o.id !== id) return [o]
              return [first, second]
            }),
          }),
          selectedOverlayId: second.id,
          selectedClipId: null,
        }
      })
    },

    updateOverlayStyle: (id, style) => {
      record(state => ({
        project: {
          ...state.project,
          textOverlays: state.project.textOverlays.map(o =>
            o.id === id ? { ...o, style: { ...o.style, ...style } } : o,
          ),
        },
      }))
    },

    removeOverlay: id => {
      record(state => ({
        project: {
          ...state.project,
          textOverlays: state.project.textOverlays.filter(o => o.id !== id),
        },
        selectedOverlayId: state.selectedOverlayId === id ? null : state.selectedOverlayId,
      }))
    },

    duplicateOverlay: id => {
      record(state => {
        const overlay = state.project.textOverlays.find(o => o.id === id)
        if (!overlay) return {}
        const maxZ = state.project.textOverlays.reduce((m, o) => Math.max(m, o.zIndex), -1)
        const copy: TextOverlay = {
          ...overlay,
          id: createEntityId('overlay'),
          startTime: overlay.startTime,
          endTime: overlay.endTime,
          x: clamp(overlay.x + 2, 0, 90),
          y: clamp(overlay.y + 2, 0, 90),
          zIndex: maxZ + 1,
        }
        return {
          project: recomputeDuration({
            ...state.project,
            textOverlays: [...state.project.textOverlays, copy],
          }),
          selectedOverlayId: copy.id,
          selectedClipId: null,
        }
      })
    },

    resetOverlayTransform: id => {
      record(state => ({
        project: {
          ...state.project,
          textOverlays: state.project.textOverlays.map(o =>
            o.id === id ? { ...o, ...DEFAULT_TEXT_OVERLAY_TRANSFORM } : o,
          ),
        },
      }))
    },

    anchorOverlay: (id, anchor) => {
      const preset = OVERLAY_ANCHOR_PRESETS[anchor]
      record(state => ({
        project: {
          ...state.project,
          textOverlays: state.project.textOverlays.map(o =>
            o.id === id ? { ...o, ...preset } : o,
          ),
        },
      }))
    },

    bringOverlayToFront: id => {
      record(state => {
        const maxZ = state.project.textOverlays.reduce((m, o) => Math.max(m, o.zIndex), -1)
        return {
          project: {
            ...state.project,
            textOverlays: state.project.textOverlays.map(o =>
              o.id === id ? { ...o, zIndex: maxZ + 1 } : o,
            ),
          },
        }
      })
    },

    sendOverlayToBack: id => {
      record(state => {
        const minZ = state.project.textOverlays.reduce((m, o) => Math.min(m, o.zIndex), 0)
        return {
          project: {
            ...state.project,
            textOverlays: state.project.textOverlays.map(o =>
              o.id === id ? { ...o, zIndex: minZ - 1 } : o,
            ),
          },
        }
      })
    },

    reorderOverlay: (id, direction) => {
      record(state => {
        const sorted = [...state.project.textOverlays].sort((a, b) => a.zIndex - b.zIndex)
        const idx = sorted.findIndex(o => o.id === id)
        if (idx === -1) return {}
        const swapIdx = idx + direction
        if (swapIdx < 0 || swapIdx >= sorted.length) return {}
        const a = sorted[idx]!
        const b = sorted[swapIdx]!
        const reordered = sorted.map((o, i) => {
          if (i === idx) return { ...o, zIndex: b.zIndex }
          if (i === swapIdx) return { ...o, zIndex: a.zIndex }
          return o
        })
        return { project: { ...state.project, textOverlays: reordered } }
      })
    },

    selectOverlay: id => set({ selectedOverlayId: id, selectedClipId: null }),

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    seek: time =>
      set(state => ({
        playhead: snapSeekTime(time, state.project.fps, state.project.duration),
      })),

    setZoom: zoom => set({ zoom: clampZoom(zoom) }),
    zoomIn: () => set(state => ({ zoom: snapToZoomLevel(state.zoom, 1) })),
    zoomOut: () => set(state => ({ zoom: snapToZoomLevel(state.zoom, -1) })),

    undo: () => {
      set(state => {
        if (state.past.length === 0) return {}
        const previous = state.past[state.past.length - 1]!
        const current = takeSnapshot(state)
        return {
          project: previous.project,
          selectedClipId: previous.selectedClipId,
          selectedOverlayId: previous.selectedOverlayId,
          past: state.past.slice(0, -1),
          future: [current, ...state.future].slice(0, HISTORY_LIMIT),
        }
      })
    },

    redo: () => {
      set(state => {
        if (state.future.length === 0) return {}
        const next = state.future[0]!
        const current = takeSnapshot(state)
        return {
          project: next.project,
          selectedClipId: next.selectedClipId,
          selectedOverlayId: next.selectedOverlayId,
          past: [...state.past, current].slice(-HISTORY_LIMIT),
          future: state.future.slice(1),
        }
      })
    },

    setFfmpegReady: ready => set({ ffmpegReady: ready }),
    setExportProgress: (progress, phase = null) => set({ exportProgress: progress, exportPhase: phase }),

    exportVideo: async (settings, runner) => {
      set({ exportProgress: 0, exportPhase: 'Preparing' })
      try {
        await runner(get().project, get().assets, settings)
      } finally {
        set({ exportProgress: null, exportPhase: null })
      }
    },

    clearProject: () => {
      const state = get()
      for (const id of Object.keys(state.assets)) {
        const asset = state.assets[id]
        if (asset && isMediaAssetAvailable(asset)) {
          URL.revokeObjectURL(asset.objectUrl)
        }
      }
      const fresh = createProject()
      fresh.name = DEFAULT_PROJECT_NAME
      fresh.resolution = { ...DEFAULT_RESOLUTION }
      set({
        project: fresh,
        assets: {},
        playhead: 0,
        isPlaying: false,
        selectedClipId: null,
        selectedOverlayId: null,
        zoom: DEFAULT_ZOOM,
        durationGuide: null,
        past: [],
        future: [],
        formatPresetId: DEFAULT_VIDEO_FORMAT_PRESET_ID,
      })
    },

    getProjectPayload: () => {
      const state = get()
      return {
        name: state.project.name,
        resolution: state.project.resolution,
        fps: state.project.fps,
        duration: state.project.duration,
        tracks: state.project.tracks,
        clips: state.project.clips,
        textOverlays: state.project.textOverlays,
        assets: state.project.assets,
      }
    },
  }
})

export type { EditorState as VideoEditorState }
