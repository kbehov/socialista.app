import type { AudioClip, Clip, Project, VideoClip } from '@socialista/types'

export type OverlayPng = {
  overlayId: string
  /** Absolute path to the PNG on disk. */
  fsPath: string
  x: number
  y: number
  start: number
  end: number
}

export type ClipInput = {
  clip: Clip
  /** Index in the inputArgs array. */
  inputIndex: number
  /** Absolute path for the input file. */
  fsPath: string
  /** True for image inputs (need -loop 1 -t). */
  isImage: boolean
  /** False when the media file has no audio stream. */
  hasAudioStream?: boolean
}

export type FilterGraph = {
  inputArgs: string[]
  filterComplex: string
  mapArgs: string[]
}

/** yuv420p requires even width/height; odd sizes cause chroma scanline artifacts. */
function even(n: number): number {
  return Math.max(2, Math.round(n) & ~1)
}

function getClipSourceEnd(clip: Pick<VideoClip, 'trimIn' | 'duration' | 'speed'>): number {
  return clip.trimIn + clip.duration * (clip.speed ?? 1)
}

/** atempo only accepts 0.5–2.0; chain filters for other speeds. */
function atempoFilters(speed: number): string[] {
  const filters: string[] = []
  let remaining = speed
  while (remaining > 2) {
    filters.push('atempo=2.0')
    remaining /= 2
  }
  while (remaining < 0.5) {
    filters.push('atempo=0.5')
    remaining /= 0.5
  }
  if (Math.abs(remaining - 1) > 0.001) {
    filters.push(`atempo=${remaining.toFixed(4)}`)
  }
  return filters
}

function buildAudioClipFilters(clip: AudioClip): string[] {
  const parts: string[] = []
  parts.push(`atrim=${clip.trimIn.toFixed(3)}:${(clip.trimIn + clip.duration).toFixed(3)}`)
  parts.push('asetpts=PTS-STARTPTS')
  parts.push(`volume=${clip.volume}`)
  if (clip.fadeIn && clip.fadeIn > 0) {
    parts.push(`afade=t=in:st=0:d=${clip.fadeIn.toFixed(3)}`)
  }
  if (clip.fadeOut && clip.fadeOut > 0) {
    const fadeStart = Math.max(0, clip.duration - clip.fadeOut)
    parts.push(`afade=t=out:st=${fadeStart.toFixed(3)}:d=${clip.fadeOut.toFixed(3)}`)
  }
  const delayMs = Math.round(clip.startTime * 1000)
  parts.push(`adelay=${delayMs}|${delayMs}`)
  return parts
}

function buildVideoAudioFilters(clip: VideoClip): string[] {
  const speed = clip.speed ?? 1
  const parts: string[] = []
  parts.push(`atrim=${clip.trimIn.toFixed(3)}:${getClipSourceEnd(clip).toFixed(3)}`)
  parts.push('asetpts=PTS-STARTPTS')
  parts.push(...atempoFilters(speed))
  parts.push(`volume=${clip.volume}`)
  const delayMs = Math.round(clip.startTime * 1000)
  parts.push(`adelay=${delayMs}|${delayMs}`)
  return parts
}

function applyVisualFilters(clip: VideoClip, parts: string[]): void {
  const eqParts: string[] = []
  let blurPart = ''
  let grayscalePart = ''
  for (const f of clip.filters) {
    if (f.type === 'brightness') eqParts.push(`brightness=${1 + f.value}`)
    if (f.type === 'contrast') eqParts.push(`contrast=${1 + f.value}`)
    if (f.type === 'saturation') eqParts.push(`saturation=${1 + f.value}`)
    if (f.type === 'blur' && f.value > 0) blurPart = `gblur=sigma=${f.value}`
    if (f.type === 'grayscale' && f.value > 0)
      grayscalePart = `hue=s=0${f.value < 1 ? `:s=${1 - f.value}` : ''}`
  }
  if (eqParts.length) parts.push(`eq=${eqParts.join(':')}`)
  if (blurPart) parts.push(blurPart)
  if (grayscalePart) parts.push(grayscalePart)
}

/**
 * Build a single filter_complex graph from the project timeline.
 *
 * Strategy:
 *   - One -i per clip (video/image) and per audio clip's source file.
 *   - Video clips: trim, setpts/speed, scale+crop, fade transitions, filters.
 *   - Normalize every clip to yuv420p + even SAR before concat/overlay.
 *   - Audio: video source audio + dedicated audio clips → volume/atempo/afade/adelay → amix.
 *   - Text overlays: sequential overlay filters on the concatenated video.
 */
export function buildFilterGraph(
  project: Project,
  clipInputs: ClipInput[],
  overlayPngs: OverlayPng[],
): FilterGraph {
  const width = even(project.resolution.width)
  const height = even(project.resolution.height)
  const { fps } = project
  const mutedTrackIds = new Set(project.tracks.filter(t => t.muted).map(t => t.id))
  const videoClips = clipInputs.filter(c => c.clip.type !== 'audio')

  const inputArgs: string[] = []
  for (const input of clipInputs) {
    if (input.isImage) {
      inputArgs.push('-loop', '1', '-t', input.clip.duration.toFixed(3), '-i', input.fsPath)
    } else {
      inputArgs.push('-i', input.fsPath)
    }
  }

  const videoLabels: string[] = []
  const filterParts: string[] = []

  videoClips.forEach((input, idx) => {
    const clip = input.clip
    if (clip.type === 'audio') return
    const inLabel = `${input.inputIndex}:v`
    const outLabel = `v${idx}`
    const parts: string[] = []
    if (clip.type === 'video') {
      parts.push(`trim=${clip.trimIn.toFixed(3)}:${getClipSourceEnd(clip).toFixed(3)}`)
      parts.push('setpts=PTS-STARTPTS')
      parts.push(`setpts=PTS/${clip.speed}`)
    } else {
      parts.push('setpts=PTS-STARTPTS')
    }
    const transform = (clip as VideoClip).transform
    if (transform) {
      const targetW = even(Math.max(2, Math.round((transform.width / 100) * width)))
      const overlayX = Math.round((transform.x / 100) * width)
      const overlayY = Math.round((transform.y / 100) * height)
      const scaledLabel = `${outLabel}_s`
      const baseLabel = `${outLabel}_b`
      // -2 keeps height divisible by 2 for yuv420p
      parts.push(`scale=${targetW}:-2`)
      if (transform.rotation !== 0) {
        parts.push(`rotate=${((transform.rotation * Math.PI) / 180).toFixed(6)}:c=black@0`)
      }
      parts.push(`fps=${fps}`)
      applyVisualFilters(clip, parts)
      parts.push('format=yuva420p', 'setsar=1')
      filterParts.push(`[${inLabel}]${parts.join(',')}[${scaledLabel}]`)
      filterParts.push(
        `color=c=black:s=${width}x${height}:d=${clip.duration.toFixed(3)}:r=${fps},format=yuv420p,setsar=1[${baseLabel}]`,
      )
      filterParts.push(
        `[${baseLabel}][${scaledLabel}]overlay=x=${overlayX}:y=${overlayY}:format=auto,format=yuv420p,setsar=1[${outLabel}]`,
      )
      videoLabels.push(`[${outLabel}]`)
      return
    }

    parts.push(`scale=${width}:${height}:force_original_aspect_ratio=increase`)
    parts.push(`crop=${width}:${height}`)
    parts.push(`fps=${fps}`)
    applyVisualFilters(clip, parts)
    if (clip.transition && clip.transition.type !== 'cut' && clip.transition.duration > 0) {
      const d = clip.transition.duration
      if (clip.transition.type === 'fade') {
        parts.push(`fade=t=in:st=0:d=${d.toFixed(3)}`)
      } else if (clip.transition.type === 'dissolve') {
        parts.push('format=yuva420p')
        parts.push(`fade=t=in:st=0:d=${d.toFixed(3)}:alpha=1`)
      }
    }
    parts.push('format=yuv420p', 'setsar=1')
    filterParts.push(`[${inLabel}]${parts.join(',')}[${outLabel}]`)
    videoLabels.push(`[${outLabel}]`)
  })

  let vfinalLabel = ''
  if (videoLabels.length > 0) {
    if (videoLabels.length === 1) {
      vfinalLabel = videoLabels[0]!.replace('[', '').replace(']', '')
    } else {
      const concatIn = videoLabels.join('')
      filterParts.push(
        `${concatIn}concat=n=${videoLabels.length}:v=1:a=0,format=yuv420p,setsar=1[vcat]`,
      )
      vfinalLabel = 'vcat'
    }
  }

  let afinalLabel = ''
  const audioLabels: string[] = []
  let audioIdx = 0

  for (const input of clipInputs) {
    const clip = input.clip
    if (mutedTrackIds.has(clip.trackId)) continue
    if (clip.volume <= 0) continue

    if (clip.type === 'audio') {
      if (input.hasAudioStream === false) continue
      const inLabel = `${input.inputIndex}:a`
      const outLabel = `a${audioIdx++}`
      filterParts.push(`[${inLabel}]${buildAudioClipFilters(clip).join(',')}[${outLabel}]`)
      audioLabels.push(`[${outLabel}]`)
      continue
    }

    if (clip.type !== 'video') continue
    if (input.hasAudioStream === false) continue
    const inLabel = `${input.inputIndex}:a`
    const outLabel = `a${audioIdx++}`
    filterParts.push(`[${inLabel}]${buildVideoAudioFilters(clip).join(',')}[${outLabel}]`)
    audioLabels.push(`[${outLabel}]`)
  }

  if (audioLabels.length === 1) {
    afinalLabel = audioLabels[0]!.replace('[', '').replace(']', '')
  } else if (audioLabels.length > 1) {
    const mixIn = audioLabels.join('')
    filterParts.push(
      `${mixIn}amix=inputs=${audioLabels.length}:duration=longest:dropout_transition=0:normalize=0[aout]`,
    )
    afinalLabel = 'aout'
  }

  let currentVideoLabel = vfinalLabel
  for (let i = 0; i < overlayPngs.length; i++) {
    const png = overlayPngs[i]!
    if (!currentVideoLabel) break
    const inputIndex = clipInputs.length + i
    const inputLabel = `${inputIndex}:v`
    const outLabel = `vt${i}`
    const mainLabel = `${outLabel}_m`
    const pngLabel = `${outLabel}_p`
    filterParts.push(`[${currentVideoLabel}]format=yuva420p[${mainLabel}]`)
    filterParts.push(`[${inputLabel}]format=rgba[${pngLabel}]`)
    filterParts.push(
      `[${mainLabel}][${pngLabel}]overlay=x=${png.x}:y=${png.y}:enable='between(t,${png.start.toFixed(3)},${png.end.toFixed(3)})':format=auto,format=yuv420p,setsar=1[${outLabel}]`,
    )
    currentVideoLabel = outLabel
  }

  for (const png of overlayPngs) {
    inputArgs.push('-i', png.fsPath)
  }

  // Final normalize so encoder always receives clean yuv420p
  if (currentVideoLabel) {
    const normalized = 'vout'
    filterParts.push(`[${currentVideoLabel}]format=yuv420p,setsar=1[${normalized}]`)
    currentVideoLabel = normalized
  }

  const mapArgs: string[] = []
  if (currentVideoLabel) mapArgs.push(`-map`, `[${currentVideoLabel}]`)
  if (afinalLabel) mapArgs.push(`-map`, `[${afinalLabel}]`)

  return {
    inputArgs,
    filterComplex: filterParts.join(';'),
    mapArgs,
  }
}
