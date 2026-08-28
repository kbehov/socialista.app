import { gateway } from '@ai-sdk/gateway'
import type { VideoCaptionSegment } from '@socialista/types'
import { transcribe } from 'ai'

const DEFAULT_MODEL = 'openai/whisper-1'
const MAX_WORDS_PER_CAPTION = 6
const MAX_CHARS_PER_CAPTION = 42
const PAUSE_BREAK_SECONDS = 0.4
const MIN_CAPTION_DURATION = 0.35
const COLLAPSED_SPAN_SECONDS = 1.5

export type GenerateCaptionsInput = {
  audio: Uint8Array
  /** Clip duration in seconds — used when the model returns collapsed timestamps. */
  durationSeconds?: number
}

export type GenerateCaptionsResult = {
  text: string
  language: string
  durationInSeconds?: number
  segments: VideoCaptionSegment[]
}

type TimedWord = {
  text: string
  startTime: number
  endTime: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function parseTimedWord(value: unknown): TimedWord | null {
  const rec = asRecord(value)
  if (!rec) return null
  const text = String(rec.word ?? rec.text ?? '')
    .trim()
    .replace(/^[,.!?…;:]+/, '')
  const startTime = Number(rec.start ?? rec.startSecond ?? rec.start_time)
  const endTime = Number(rec.end ?? rec.endSecond ?? rec.end_time)
  if (!text || !Number.isFinite(startTime) || !Number.isFinite(endTime)) return null
  return {
    text,
    startTime: Math.max(0, startTime),
    endTime: Math.max(startTime, endTime),
  }
}

function wordsFromProviderMetadata(metadata: Record<string, unknown>): TimedWord[] {
  const words: TimedWord[] = []
  for (const value of Object.values(metadata)) {
    const rec = asRecord(value)
    if (!rec) continue
    const raw = rec.words ?? rec.word_timestamps
    if (!Array.isArray(raw)) continue
    for (const item of raw) {
      const word = parseTimedWord(item)
      if (word) words.push(word)
    }
  }
  return words
}

function wordsFromSegments(
  segments: Array<{ text: string; startSecond: number; endSecond: number }>,
): TimedWord[] {
  return segments.flatMap(segment => {
    const text = segment.text.trim()
    if (!text) return []
    const startTime = Math.max(0, segment.startSecond)
    const endTime = Math.max(startTime, segment.endSecond)
    const tokens = text.split(/\s+/).filter(Boolean)
    if (tokens.length <= 1) {
      return [{ text, startTime, endTime }]
    }
    const span = Math.max(endTime - startTime, 0.05)
    return tokens.map((token, index) => {
      const t0 = startTime + (index / tokens.length) * span
      const t1 = startTime + ((index + 1) / tokens.length) * span
      return { text: token, startTime: t0, endTime: t1 }
    })
  })
}

function wordsFromPlainText(text: string, durationSeconds: number): TimedWord[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const span = Math.max(durationSeconds, MIN_CAPTION_DURATION)
  return tokens.map((token, index) => {
    const t0 = (index / tokens.length) * span
    const t1 = ((index + 1) / tokens.length) * span
    return { text: token, startTime: t0, endTime: Math.max(t0 + MIN_CAPTION_DURATION, t1) }
  })
}

function isSentenceEnd(text: string): boolean {
  return /[.!?…]$/.test(text)
}

function chunkWords(words: TimedWord[]): VideoCaptionSegment[] {
  if (words.length === 0) return []

  const chunks: VideoCaptionSegment[] = []
  let current: TimedWord[] = []

  const flush = () => {
    if (current.length === 0) return
    const first = current[0]!
    const last = current[current.length - 1]!
    const text = current
      .map(word => word.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) {
      chunks.push({
        text,
        startTime: first.startTime,
        endTime: Math.max(first.startTime + MIN_CAPTION_DURATION, last.endTime),
      })
    }
    current = []
  }

  for (const word of words) {
    if (current.length === 0) {
      current.push(word)
      continue
    }

    const prev = current[current.length - 1]!
    const gap = word.startTime - prev.endTime
    const nextText = `${current.map(item => item.text).join(' ')} ${word.text}`
    if (
      isSentenceEnd(prev.text) ||
      gap >= PAUSE_BREAK_SECONDS ||
      current.length >= MAX_WORDS_PER_CAPTION ||
      nextText.length > MAX_CHARS_PER_CAPTION
    ) {
      flush()
    }
    current.push(word)
  }
  flush()

  for (let i = 0; i < chunks.length - 1; i++) {
    const currentChunk = chunks[i]!
    const nextChunk = chunks[i + 1]!
    if (currentChunk.endTime > nextChunk.startTime) {
      currentChunk.endTime = Math.max(
        currentChunk.startTime + MIN_CAPTION_DURATION,
        nextChunk.startTime,
      )
    }
  }

  return chunks.filter(chunk => chunk.endTime > chunk.startTime && chunk.text.length > 0)
}

function rescaleWords(words: TimedWord[], durationSeconds: number): TimedWord[] {
  if (words.length === 0 || durationSeconds <= 0) return words
  const first = words[0]!.startTime
  const last = words[words.length - 1]!.endTime
  const span = Math.max(last - first, 0.01)
  const wordsPerSecond = words.length / span
  const collapsed = span < COLLAPSED_SPAN_SECONDS && durationSeconds > span * 2 && wordsPerSecond > 8
  if (!collapsed) return words
  return wordsFromPlainText(words.map(word => word.text).join(' '), durationSeconds)
}

export async function generateCaptions({
  audio,
  durationSeconds,
}: GenerateCaptionsInput): Promise<GenerateCaptionsResult> {
  if (audio.byteLength === 0) {
    throw new Error('Audio is empty')
  }

  const result = await transcribe({
    model: gateway.transcriptionModel(DEFAULT_MODEL),
    audio,
    providerOptions: {
      openai: {
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment'],
      },
    },
  })

  const fallbackDuration = Math.max(
    durationSeconds ?? 0,
    result.durationInSeconds ?? 0,
    MIN_CAPTION_DURATION,
  )

  const metadataWords = wordsFromProviderMetadata(result.providerMetadata)
  const segmentWords = wordsFromSegments(result.segments)
  const rawWords =
    metadataWords.length > 0
      ? metadataWords
      : segmentWords.length > 0
        ? segmentWords
        : wordsFromPlainText(result.text, fallbackDuration)

  const words = rescaleWords(rawWords, fallbackDuration)
  const segments = chunkWords(words)
  if (segments.length === 0) {
    throw new Error('No speech was detected in this clip')
  }

  return {
    text: result.text.trim(),
    language: result.language ?? 'en',
    durationInSeconds: result.durationInSeconds ?? durationSeconds,
    segments,
  }
}
