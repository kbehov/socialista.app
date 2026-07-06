import type {
  AudioClip,
  CanvasDimensions,
  Clip,
  ClipId,
  Project,
  TextOverlay,
  Track,
  TrackId,
  VideoClip,
} from '@socialista/types'

import type { MediaAsset } from './types'
import type { SerializedMediaAsset } from '@socialista/types'

export const DEFAULT_RESOLUTION: CanvasDimensions = { width: 1080, height: 1920 }
export const DEFAULT_FPS = 30
export const DEFAULT_PROJECT_NAME = 'Untitled video'

export const ZOOM_LEVELS = [20, 40, 60, 100, 150, 220, 300] as const
export const DEFAULT_ZOOM = 60
export const MIN_ZOOM = ZOOM_LEVELS[0]
export const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1]

export const HISTORY_LIMIT = 50

export const THUMBNAIL_COUNT = 8
export const WAVEFORM_PEAKS = 1500

/** Soft warning threshold for imports (bytes). */
export const MAX_IMPORT_BYTES_WARN = 200 * 1024 * 1024
/** Hard rejection threshold for imports (bytes). */
export const HARD_IMPORT_LIMIT = 500 * 1024 * 1024

export const MIN_CLIP_SPEED = 0.25
export const MAX_CLIP_SPEED = 4

export const DEFAULT_FONT = 'Inter, system-ui, sans-serif'

export const DEFAULT_IMAGE_CLIP_DURATION = 5

export const DEFAULT_TEXT_OVERLAY_STYLE: TextOverlay['style'] = {
  fontFamily: DEFAULT_FONT,
  fontSize: 64,
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: null,
  textAlign: 'center',
  letterSpacing: 0,
  lineHeight: 1.2,
  padding: 0,
  borderRadius: 0,
  animation: 'none',
}

export function createEntityId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function createTrack(type: 'video' | 'audio', name?: string): Track {
  return {
    id: createEntityId('track'),
    type,
    name: name ?? (type === 'video' ? 'Video track' : 'Audio track'),
    muted: false,
    locked: false,
    clips: [],
  }
}

export function createVideoClip(
  asset: MediaAsset,
  trackId: TrackId,
  startTime: number,
  duration?: number,
): VideoClip {
  const resolvedDuration =
    duration ?? (asset.type === 'image' ? DEFAULT_IMAGE_CLIP_DURATION : asset.duration)
  return {
    id: createEntityId('clip'),
    type: asset.type === 'image' ? 'image' : 'video',
    assetId: asset.id,
    trackId,
    startTime,
    duration: resolvedDuration,
    trimIn: 0,
    trimOut: 0,
    volume: 1,
    speed: 1,
    filters: [],
  }
}

export function createAudioClip(asset: MediaAsset, trackId: TrackId, startTime: number): AudioClip {
  return {
    id: createEntityId('clip'),
    type: 'audio',
    assetId: asset.id,
    trackId,
    startTime,
    duration: asset.duration,
    trimIn: 0,
    trimOut: 0,
    volume: 1,
    fadeIn: 0,
    fadeOut: 0,
  }
}

export function createClip(
  asset: MediaAsset,
  trackId: TrackId,
  startTime: number,
  duration?: number,
): Clip {
  return asset.type === 'audio'
    ? createAudioClip(asset, trackId, startTime)
    : createVideoClip(asset, trackId, startTime, duration)
}

export function createTextOverlay(startTime: number, endTime: number, zIndex: number): TextOverlay {
  return {
    id: createEntityId('overlay'),
    type: 'text',
    content: 'Your text here',
    startTime,
    endTime,
    x: 10,
    y: 40,
    width: 80,
    rotation: 0,
    zIndex,
    style: { ...DEFAULT_TEXT_OVERLAY_STYLE },
  }
}

export function createProject(): Project {
  const videoTrack = createTrack('video')
  return {
    id: createEntityId('project'),
    name: DEFAULT_PROJECT_NAME,
    duration: 0,
    resolution: { ...DEFAULT_RESOLUTION },
    fps: DEFAULT_FPS,
    tracks: [videoTrack],
    clips: {},
    textOverlays: [],
    assets: [],
  }
}

export function toSerializedAsset(asset: MediaAsset): SerializedMediaAsset {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    hash: asset.hash,
    duration: asset.duration,
    width: asset.width,
    height: asset.height,
    url: asset.url,
    fileId: asset.fileId,
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function clampZoom(zoom: number): number {
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM)
}

export function snapToZoomLevel(zoom: number, direction: 1 | -1): number {
  const idx = ZOOM_LEVELS.findIndex(level => level === zoom)
  if (idx === -1) {
    // Snap to nearest
    const nearest = ZOOM_LEVELS.reduce((best, level) =>
      Math.abs(level - zoom) < Math.abs(best - zoom) ? level : best,
    )
    return snapToZoomLevel(nearest, direction)
  }
  const next = clamp(idx + direction, 0, ZOOM_LEVELS.length - 1)
  return ZOOM_LEVELS[next]!
}

/**
 * Source duration of a clip's underlying media.
 *
 * For video/audio with a probed asset, this is `asset.duration`. For images
 * (where `asset.duration` is `0`) and for clips whose asset is missing, fall
 * back to the clip's trim invariant `trimIn + duration + trimOut` so trims
 * remain reversible after reloads or asset removal.
 */
export function getClipSourceDuration(
  clip: Clip,
  asset: { duration: number } | undefined,
): number {
  if (asset && asset.duration > 0) return asset.duration
  return clip.trimIn + clip.duration + clip.trimOut
}

/** Recompute the project duration as the max clip/overlay end time. */
export function computeProjectDuration(project: Project): number {
  let max = 0
  for (const clipId of Object.keys(project.clips)) {
    const clip = project.clips[clipId]
    if (!clip) continue
    const end = clip.startTime + clip.duration
    if (end > max) max = end
  }
  for (const overlay of project.textOverlays) {
    if (overlay.endTime > max) max = overlay.endTime
  }
  return max
}

/** Sort track clip ids by startTime. */
export function sortTrackClips(project: Project, trackId: TrackId): ClipId[] {
  const track = project.tracks.find(t => t.id === trackId)
  if (!track) return []
  return [...track.clips].sort((a, b) => {
    const ca = project.clips[a]
    const cb = project.clips[b]
    if (!ca || !cb) return 0
    return ca.startTime - cb.startTime
  })
}

/** Insert a clip into project.clips and append its id on the target track (sorted). */
export function withClipOnTrack(project: Project, clip: Clip, trackId: TrackId): Project {
  const clips = { ...project.clips, [clip.id]: clip }
  const tracks = project.tracks.map(track => {
    if (track.id !== trackId) return track
    const clipIds = track.clips.includes(clip.id) ? track.clips : [...track.clips, clip.id]
    return { ...track, clips: clipIds }
  })
  const merged: Project = { ...project, clips, tracks }
  return {
    ...merged,
    tracks: merged.tracks.map(track =>
      track.id === trackId ? { ...track, clips: sortTrackClips(merged, trackId) } : track,
    ),
  }
}

/** Move a clip to a new track/start time, keeping track clip id lists in sync. */
export function withClipMoved(
  project: Project,
  clipId: ClipId,
  newStartTime: number,
  newTrackId: TrackId,
): Project {
  const clip = project.clips[clipId]
  if (!clip) return project
  const updatedClip: Clip = { ...clip, trackId: newTrackId, startTime: newStartTime }
  const clips = { ...project.clips, [clipId]: updatedClip }
  const tracks = project.tracks.map(track => ({
    ...track,
    clips: track.clips.filter(id => id !== clipId),
  }))
  const merged: Project = { ...project, clips, tracks }
  const withTarget: Project = {
    ...merged,
    tracks: merged.tracks.map(track =>
      track.id === newTrackId ? { ...track, clips: [...track.clips, clipId] } : track,
    ),
  }
  return {
    ...withTarget,
    tracks: withTarget.tracks.map(track =>
      track.id === newTrackId ? { ...track, clips: sortTrackClips(withTarget, newTrackId) } : track,
    ),
  }
}

/**
 * Move a clip to a desired start time on its own track, reordering it past
 * neighbours when the drop position crosses a neighbour's midpoint. Clips
 * after the insertion point shift right as needed so no overlaps remain.
 *
 * Midpoint heuristic: dropping in the first half of a neighbour inserts
 * before it (reorder); dropping in the second half inserts after it (reorder
 * or clamp to the neighbour's edge). Dropping in a gap that fits the clip
 * just moves it without disturbing anything else.
 */
export function withClipReordered(
  project: Project,
  clipId: ClipId,
  desiredStart: number,
): Project {
  const clip = project.clips[clipId]
  if (!clip) return project
  const track = project.tracks.find(t => t.id === clip.trackId)
  if (!track) return project

  const others = track.clips
    .filter(id => id !== clipId)
    .map(id => project.clips[id])
    .filter((c): c is Clip => c !== undefined)
    .sort((a, b) => a.startTime - b.startTime)

  const duration = clip.duration
  const candidate = Math.max(0, desiredStart)

  let insertIdx = others.length
  for (let i = 0; i < others.length; i++) {
    const other = others[i]
    if (!other) continue
    const midpoint = other.startTime + other.duration / 2
    if (candidate < midpoint) {
      insertIdx = i
      break
    }
  }

  const prev = insertIdx > 0 ? others[insertIdx - 1] : null
  const lowerBound = prev ? prev.startTime + prev.duration : 0
  const xStart = Math.max(lowerBound, candidate)

  const clips = { ...project.clips, [clipId]: { ...clip, startTime: xStart } }
  let currentEnd = xStart + duration
  for (let i = insertIdx; i < others.length; i++) {
    const other = others[i]
    if (!other) continue
    if (other.startTime < currentEnd) {
      clips[other.id] = { ...other, startTime: currentEnd }
      currentEnd = currentEnd + other.duration
    } else {
      break
    }
  }

  const updatedProject: Project = { ...project, clips }
  const tracks = project.tracks.map(t =>
    t.id === track.id ? { ...t, clips: sortTrackClips(updatedProject, track.id) } : t,
  )
  const withTracks: Project = { ...updatedProject, tracks }
  return { ...withTracks, duration: computeProjectDuration(withTracks) }
}
