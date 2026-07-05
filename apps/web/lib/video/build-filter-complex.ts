import type { Clip, Project } from '@socialista/types'
import type { OverlayPng } from './export-text-png'

export type FilterGraph = {
  /** ffmpeg `-i` arguments per clip, in order. */
  inputArgs: string[]
  /** The full `-filter_complex` string. */
  filterComplex: string
  /** Output `-map` arguments. */
  mapArgs: string[]
}

type ClipInput = {
  clip: Clip
  /** Index in the inputArgs array. */
  inputIndex: number
  /** Path in ffmpeg FS for the input file. */
  fsPath: string
  /** True for image inputs (need -loop 1 -t). */
  isImage: boolean
}

/**
 * Build a single filter_complex graph from the project timeline.
 *
 * Strategy:
 *   - One -i per clip (video/image) and per audio clip's source file.
 *   - Video clips: trim, setpts/speed, scale+crop, fade transitions, filters.
 *   - Concat all video streams.
 *   - Audio: per-clip atrim/atempo/volume/afade/adelay, then amix.
 *   - Text overlays: sequential overlay filters on the concatenated video.
 */
export function buildFilterGraph(
  project: Project,
  clipInputs: ClipInput[],
  overlayPngs: OverlayPng[],
): FilterGraph {
  const { resolution, fps } = project
  const videoClips = clipInputs.filter(c => c.clip.type !== 'audio')
  const audioClips = clipInputs.filter(c => c.clip.type === 'audio')

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
      parts.push(`trim=${clip.trimIn.toFixed(3)}:${(clip.trimIn + clip.duration).toFixed(3)}`)
      parts.push('setpts=PTS-STARTPTS')
      parts.push(`setpts=PTS/${clip.speed}`)
    } else {
      // Image: trim is N/A; loop input already constrained to duration
      parts.push('setpts=PTS-STARTPTS')
    }
    parts.push(`scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=increase`)
    parts.push(`crop=${resolution.width}:${resolution.height}`)
    parts.push(`fps=${fps}`)
    // Filters
    const eqParts: string[] = []
    let blurPart = ''
    let grayscalePart = ''
    for (const f of clip.filters) {
      if (f.type === 'brightness') eqParts.push(`brightness=${1 + f.value}`)
      if (f.type === 'contrast') eqParts.push(`contrast=${1 + f.value}`)
      if (f.type === 'saturation') eqParts.push(`saturation=${1 + f.value}`)
      if (f.type === 'blur' && f.value > 0) blurPart = `gblur=sigma=${f.value}`
      if (f.type === 'grayscale' && f.value > 0) grayscalePart = `hue=s=0${f.value < 1 ? `:s=${1 - f.value}` : ''}`
    }
    if (eqParts.length) parts.push(`eq=${eqParts.join(':')}`)
    if (blurPart) parts.push(blurPart)
    if (grayscalePart) parts.push(grayscalePart)
    // Transition (simplified: fade in/out for non-cut)
    if (clip.transition && clip.transition.type !== 'cut' && clip.transition.duration > 0) {
      const d = clip.transition.duration
      if (clip.transition.type === 'fade') {
        parts.push(`fade=t=in:st=0:d=${d.toFixed(3)}`)
      } else if (clip.transition.type === 'dissolve') {
        parts.push(`fade=t=in:st=0:d=${d.toFixed(3)}:alpha=1`)
      }
    }
    filterParts.push(`[${inLabel}]${parts.join(',')}[${outLabel}]`)
    videoLabels.push(`[${outLabel}]`)
  })

  // Concat video
  let vfinalLabel = ''
  if (videoLabels.length > 0) {
    if (videoLabels.length === 1) {
      vfinalLabel = videoLabels[0]!.replace('[', '').replace(']', '')
    } else {
      const concatIn = videoLabels.join('')
      filterParts.push(`${concatIn}concat=n=${videoLabels.length}:v=1:a=0[vcat]`)
      vfinalLabel = 'vcat'
    }
  }

  // Audio mix
  let afinalLabel = ''
  const audioLabels: string[] = []
  if (audioClips.length > 0) {
    audioClips.forEach((input, idx) => {
      const clip = input.clip
      if (clip.type !== 'audio') return
      const inLabel = `${input.inputIndex}:a`
      const outLabel = `a${idx}`
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
      filterParts.push(`[${inLabel}]${parts.join(',')}[${outLabel}]`)
      audioLabels.push(`[${outLabel}]`)
    })
    if (audioLabels.length === 1) {
      afinalLabel = audioLabels[0]!.replace('[', '').replace(']', '')
    } else {
      const mixIn = audioLabels.join('')
      filterParts.push(`${mixIn}amix=inputs=${audioLabels.length}:duration=longest:dropout_transition=0[aout]`)
      afinalLabel = 'aout'
    }
  }

  // Overlay text PNGs sequentially on the concatenated video
  let currentVideoLabel = vfinalLabel
  for (let i = 0; i < overlayPngs.length; i++) {
    const png = overlayPngs[i]!
    if (!currentVideoLabel) break
    const inputIndex = clipInputs.length + i
    const inputLabel = `${inputIndex}:v`
    const outLabel = `vt${i}`
    filterParts.push(
      `[${currentVideoLabel}][${inputLabel}]overlay=x=${png.x}:y=${png.y}:enable='between(t,${png.start.toFixed(3)},${png.end.toFixed(3)})'[${outLabel}]`,
    )
    currentVideoLabel = outLabel
  }

  // Add overlay PNG inputs to inputArgs
  for (const png of overlayPngs) {
    inputArgs.push('-i', png.fsPath)
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

/** Resolve which file path to mount each clip's source from. */
export function clipInputFsPath(clip: Clip): string {
  return `/input_${clip.assetId}_${clip.id}.${clip.type === 'audio' ? 'bin' : 'bin'}`
}

export type { ClipInput }
