'use client'

import { useEffect, useRef } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import type { Clip, ClipId, Project, VideoClip } from '@socialista/types'

type VideoSlot = {
  video: HTMLVideoElement
  clipId: ClipId
}

type ImageSlot = {
  image: HTMLImageElement
  clipId: ClipId
}

type AudioSlot = {
  source: AudioBufferSourceNode
  gain: GainNode
  clipId: ClipId
}

const previewSeekRef: { current: ((time: number) => void) | null } = { current: null }

/** Seek preview canvas immediately (used by timeline scrubbing). */
export function seekPreview(time: number) {
  previewSeekRef.current?.(time)
}

function usePreviewSeekRegistration(seekTo: (time: number) => void) {
  useEffect(() => {
    previewSeekRef.current = seekTo
    return () => {
      if (previewSeekRef.current === seekTo) {
        previewSeekRef.current = null
      }
    }
  }, [seekTo])
}

/**
 * Real-time preview playback engine.
 *
 * Maintains a pool of hidden <video> elements (one per active video clip) and
 * schedules audio via Web Audio. On each animation frame the active clip's
 * current frame is drawn onto the supplied canvas.
 */
export function usePlayback(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const videoSlotsRef = useRef<Map<ClipId, VideoSlot>>(new Map())
  const imageSlotsRef = useRef<Map<ClipId, ImageSlot>>(new Map())
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const activeAudioSlotsRef = useRef<AudioSlot[]>([])
  const rafRef = useRef<number | null>(null)
  const startClockRef = useRef<number>(0)
  const startPlayheadRef = useRef<number>(0)
  const lastPlayheadStoreWriteRef = useRef<number>(0)

  const tracks = useVideoEditorStore(s => s.project.tracks)
  const clips = useVideoEditorStore(s => s.project.clips)
  const assets = useVideoEditorStore(s => s.assets)
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const playhead = useVideoEditorStore(s => s.playhead)
  const activeVisualKey = useVideoEditorStore(s =>
    getActiveClipVisualKey(s.project.tracks, s.project.clips, s.assets, s.playhead),
  )
  const play = useVideoEditorStore(s => s.play)
  const pause = useVideoEditorStore(s => s.pause)
  const seek = useVideoEditorStore(s => s.seek)

  const getAsset = (clip: Clip) => assets[clip.assetId]

  /** Acquire or reuse a visual element for a clip. */
  const getVideoSlot = (clip: Clip): VideoSlot | null => {
    if (clip.type === 'audio') return null
    const asset = getAsset(clip)
    if (!asset || !isMediaAssetAvailable(asset)) return null
    if (clip.type === 'image') return null
    const existing = videoSlotsRef.current.get(clip.id)
    if (existing) return existing
    const video = document.createElement('video')
    video.src = asset.objectUrl
    video.muted = true // Audio handled via Web Audio for sync
    video.playsInline = true
    video.preload = 'auto'
    video.crossOrigin = 'anonymous'
    videoSlotsRef.current.set(clip.id, { video, clipId: clip.id })
    return { video, clipId: clip.id }
  }

  const getImageSlot = (clip: Clip): ImageSlot | null => {
    if (clip.type !== 'image') return null
    const asset = getAsset(clip)
    if (!asset || !isMediaAssetAvailable(asset)) return null
    const existing = imageSlotsRef.current.get(clip.id)
    if (existing) return existing
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = asset.objectUrl
    const slot = { image, clipId: clip.id }
    imageSlotsRef.current.set(clip.id, slot)
    return slot
  }

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      const Ctor: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      audioCtxRef.current = new Ctor()
    }
    return audioCtxRef.current
  }

  const ensureAudioBuffer = async (clip: Clip): Promise<AudioBuffer | null> => {
    if (clip.type !== 'audio' && clip.type === 'image') return null
    const asset = getAsset(clip)
    if (!asset || !isMediaAssetAvailable(asset)) return null
    const cached = audioBuffersRef.current.get(asset.id)
    if (cached) return cached
    const ctx = getAudioContext()
    if (!ctx) return null
    try {
      const buf = await asset.file.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(buf.slice(0))
      audioBuffersRef.current.set(asset.id, audioBuffer)
      return audioBuffer
    } catch {
      return null
    }
  }

  const stopAllAudio = () => {
    for (const slot of activeAudioSlotsRef.current) {
      try {
        slot.source.stop()
      } catch {
        // Already stopped
      }
      slot.source.disconnect()
      slot.gain.disconnect()
    }
    activeAudioSlotsRef.current = []
  }

  const stopAllVideo = () => {
    for (const slot of videoSlotsRef.current.values()) {
      try {
        slot.video.pause()
      } catch {
        // noop
      }
    }
  }

  const drawFrame = (clip: Clip) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let mediaW = 0
    let mediaH = 0
    let source: CanvasImageSource | null = null

    if (clip.type === 'image') {
      const slot = getImageSlot(clip)
      if (!slot || !slot.image.naturalWidth) return
      mediaW = slot.image.naturalWidth
      mediaH = slot.image.naturalHeight
      source = slot.image
    } else {
      const slot = getVideoSlot(clip)
      if (!slot || !slot.video.videoWidth) return
      mediaW = slot.video.videoWidth
      mediaH = slot.video.videoHeight
      source = slot.video
    }

    const w = canvas.width
    const h = canvas.height
    const scale = Math.max(w / mediaW, h / mediaH)
    const drawW = mediaW * scale
    const drawH = mediaH * scale
    const dx = (w - drawW) / 2
    const dy = (h - drawH) / 2
    if (clip.type !== 'audio') {
      const filterStr = filtersToCss(clip.filters)
      ctx.filter = filterStr || 'none'
    }
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    try {
      ctx.drawImage(source, dx, dy, drawW, drawH)
    } catch {
      // Media not ready
    }
    ctx.filter = 'none'
  }

  const tick = () => {
    const state = useVideoEditorStore.getState()
    if (!state.isPlaying) {
      rafRef.current = null
      return
    }
    // eslint-disable-next-line react-hooks/purity -- RAF loop reads wall clock to advance playhead
    const now = performance.now()
    const elapsed = (now - startClockRef.current) / 1000
    const newTime = startPlayheadRef.current + elapsed
    if (newTime >= state.project.duration) {
      pause()
      seek(0)
      rafRef.current = null
      return
    }
    // Update store playhead at ~30Hz
    if (now - lastPlayheadStoreWriteRef.current > 33) {
      seek(newTime)
      lastPlayheadStoreWriteRef.current = now
    }
    // Determine active video clip (top-most non-muted video track)
    const activeVideoClip = pickActiveVideoClip(state.project.tracks, state.project.clips, state.assets, newTime)
    if (activeVideoClip) {
      if (activeVideoClip.type === 'image') {
        const slot = getImageSlot(activeVideoClip)
        if (slot?.image.complete) {
          drawFrame(activeVideoClip)
        } else if (slot) {
          slot.image.onload = () => drawFrame(activeVideoClip)
        }
      } else {
        const slot = getVideoSlot(activeVideoClip)
        if (slot) {
          const localTime = newTime - activeVideoClip.startTime + activeVideoClip.trimIn
          const video = slot.video
          if (Math.abs(video.currentTime - localTime) > 0.15) {
            try {
              video.currentTime = localTime
            } catch {
              // noop
            }
          }
          if (video.paused && video.readyState >= 2) {
            void video.play().catch(() => {
              // Autoplay blocked; pause store
            })
          }
          drawFrame(activeVideoClip)
        }
      }
    } else {
      // Clear canvas
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const startPlayback = async () => {
    const state = useVideoEditorStore.getState()
    if (state.isPlaying) return
    if (state.playhead >= state.project.duration) {
      seek(0)
    }
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        // noop
      }
    }
    // eslint-disable-next-line react-hooks/purity -- playback start records wall clock
    startClockRef.current = performance.now()
    startPlayheadRef.current = useVideoEditorStore.getState().playhead
    // eslint-disable-next-line react-hooks/purity -- playback start records wall clock
    lastPlayheadStoreWriteRef.current = performance.now()
    // Schedule audio for active clips
    scheduleAudioAt(useVideoEditorStore.getState().playhead)
    play()
    rafRef.current = requestAnimationFrame(tick)
  }

  const scheduleAudioAt = async (fromTime: number) => {
    stopAllAudio()
    const state = useVideoEditorStore.getState()
    const ctx = getAudioContext()
    if (!ctx) return
    for (const track of state.project.tracks) {
      if (track.muted) continue
      for (const clipId of track.clips) {
        const clip = state.project.clips[clipId]
        if (!clip || clip.type !== 'audio') continue
        const asset = state.assets[clip.assetId]
        if (!asset || !isMediaAssetAvailable(asset)) continue
        const clipEnd = clip.startTime + clip.duration
        if (clipEnd <= fromTime) continue
        if (clip.startTime > fromTime + 5) continue // schedule near-future only
        const buffer = await ensureAudioBuffer(clip)
        if (!buffer) continue
        const source = ctx.createBufferSource()
        source.buffer = buffer
        const gain = ctx.createGain()
        const targetVolume = clip.volume
        const offsetInClip = Math.max(0, fromTime - clip.startTime)
        const startInBuffer = clip.trimIn + offsetInClip
        const whenStart = ctx.currentTime + Math.max(0, clip.startTime - fromTime)
        gain.gain.setValueAtTime(targetVolume, whenStart)
        if (clip.fadeIn && clip.fadeIn > 0 && offsetInClip < clip.fadeIn) {
          gain.gain.setValueAtTime(0, whenStart)
          gain.gain.linearRampToValueAtTime(targetVolume, whenStart + (clip.fadeIn - offsetInClip))
        }
        if (clip.fadeOut && clip.fadeOut > 0) {
          const fadeStart = whenStart + (clip.duration - offsetInClip - clip.fadeOut)
          if (fadeStart > whenStart) {
            gain.gain.setValueAtTime(targetVolume, fadeStart)
            gain.gain.linearRampToValueAtTime(0, fadeStart + clip.fadeOut)
          }
        }
        source.connect(gain).connect(ctx.destination)
        try {
          source.start(whenStart, Math.max(0, startInBuffer), Math.max(0, clip.duration - offsetInClip))
          activeAudioSlotsRef.current.push({ source, gain, clipId: clip.id })
        } catch {
          // noop
        }
      }
    }
  }

  const stopPlayback = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    stopAllVideo()
    stopAllAudio()
    pause()
  }

  const seekTo = (time: number) => {
    const state = useVideoEditorStore.getState()
    const wasPlaying = state.isPlaying
    if (wasPlaying) {
      stopPlayback()
    }
    seek(time)
    // Draw a single frame for the new time
    const activeVideoClip = pickActiveVideoClip(state.project.tracks, state.project.clips, state.assets, time)
    if (activeVideoClip) {
      if (activeVideoClip.type === 'image') {
        const slot = getImageSlot(activeVideoClip)
        if (slot?.image.complete) {
          drawFrame(activeVideoClip)
        } else if (slot) {
          slot.image.onload = () => drawFrame(activeVideoClip)
        }
      } else {
        const slot = getVideoSlot(activeVideoClip)
        if (slot) {
          const localTime = time - activeVideoClip.startTime + activeVideoClip.trimIn
          slot.video.currentTime = localTime
          const onSeeked = () => {
            slot.video.removeEventListener('seeked', onSeeked)
            drawFrame(activeVideoClip)
          }
          slot.video.addEventListener('seeked', onSeeked, { once: true })
        }
      }
    } else {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }

  // React to isPlaying toggles
  useEffect(() => {
    if (isPlaying) {
      void startPlayback()
    } else {
      stopPlayback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])

  // React to playhead seeks and visual property changes while paused
  useEffect(() => {
    if (isPlaying) return
    const state = useVideoEditorStore.getState()
    const activeVideoClip = pickActiveVideoClip(
      state.project.tracks,
      state.project.clips,
      state.assets,
      playhead,
    )
    if (activeVideoClip) {
      if (activeVideoClip.type === 'image') {
        const slot = getImageSlot(activeVideoClip)
        if (slot?.image.complete) {
          drawFrame(activeVideoClip)
        } else if (slot) {
          slot.image.onload = () => drawFrame(activeVideoClip)
        }
      } else {
        const slot = getVideoSlot(activeVideoClip)
        if (slot) {
          const localTime = playhead - activeVideoClip.startTime + activeVideoClip.trimIn
          if (Math.abs(slot.video.currentTime - localTime) > 0.05) {
            slot.video.currentTime = localTime
          }
          const onSeeked = () => {
            slot.video.removeEventListener('seeked', onSeeked)
            drawFrame(activeVideoClip)
          }
          if (slot.video.readyState >= 2) {
            if (Math.abs(slot.video.currentTime - localTime) <= 0.05) {
              drawFrame(activeVideoClip)
            } else {
              slot.video.addEventListener('seeked', onSeeked, { once: true })
            }
          } else {
            slot.video.addEventListener('loadeddata', onSeeked, { once: true })
          }
        }
      }
    } else {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playhead, activeVisualKey, isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      for (const slot of videoSlotsRef.current.values()) {
        slot.video.removeAttribute('src')
        slot.video.load()
      }
      videoSlotsRef.current.clear()
      imageSlotsRef.current.clear()
      stopAllAudio()
      audioBuffersRef.current.clear()
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [])

  usePreviewSeekRegistration(seekTo)

  return {
    play: () => {
      void startPlayback()
    },
    pause: stopPlayback,
    toggle: () => {
      if (useVideoEditorStore.getState().isPlaying) {
        stopPlayback()
      } else {
        void startPlayback()
      }
    },
    seekTo,
  }
}

function pickActiveVideoClip(
  tracks: Project['tracks'],
  clips: Project['clips'],
  assets: Record<string, unknown>,
  time: number,
): VideoClip | null {
  for (let i = tracks.length - 1; i >= 0; i--) {
    const track = tracks[i]
    if (!track || track.type !== 'video' || track.muted) continue
    for (const clipId of track.clips) {
      const clip = clips[clipId]
      if (!clip) continue
      if (clip.type === 'audio') continue
      if (time >= clip.startTime && time < clip.startTime + clip.duration) {
        const asset = assets[clip.assetId]
        if (!asset) continue
        return clip
      }
    }
  }
  return null
}

function getActiveClipVisualKey(
  tracks: Project['tracks'],
  clips: Project['clips'],
  assets: Record<string, unknown>,
  time: number,
): string | null {
  const clip = pickActiveVideoClip(tracks, clips, assets, time)
  if (!clip) return null
  return `${clip.id}:${clip.trimIn}:${clip.trimOut}:${clip.startTime}:${clip.duration}:${clip.speed}:${JSON.stringify(clip.filters)}`
}

function filtersToCss(filters: VideoClip['filters'] | undefined): string {
  if (!filters || !filters.length) return ''
  const parts: string[] = []
  for (const f of filters) {
    switch (f.type) {
      case 'brightness':
        parts.push(`brightness(${1 + f.value})`)
        break
      case 'contrast':
        parts.push(`contrast(${1 + f.value})`)
        break
      case 'saturation':
        parts.push(`saturate(${1 + f.value})`)
        break
      case 'blur':
        parts.push(`blur(${f.value}px)`)
        break
      case 'grayscale':
        parts.push(`grayscale(${f.value})`)
        break
    }
  }
  return parts.join(' ')
}
