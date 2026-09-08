import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import type {
  GenerateTextToSpeechInput,
  GetVoicesInput,
  GetVoicesResult,
  SearchUgcVoicesResponse,
  UgcVoice,
} from '@socialista/types'

let elevenLabsClient: ElevenLabsClient | undefined

function getElevenLabsClient() {
  if (elevenLabsClient) return elevenLabsClient
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured')
  }
  elevenLabsClient = new ElevenLabsClient({ apiKey })
  return elevenLabsClient
}

const DEFAULT_MODEL = 'eleven_multilingual_v2'

function to01(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.min(1, Math.max(0, value > 1 ? value / 100 : value))
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  if (Buffer.isBuffer(stream)) return stream
  if (stream instanceof Uint8Array) return Buffer.from(stream)
  if (stream instanceof ArrayBuffer) return Buffer.from(stream)

  if (stream && typeof stream === 'object' && 'data' in stream) {
    const nested = (stream as { data: unknown }).data
    if (nested && nested !== stream) return streamToBuffer(nested)
  }

  if (stream && typeof stream === 'object' && 'arrayBuffer' in stream) {
    const response = stream as { arrayBuffer: () => Promise<ArrayBuffer> }
    if (typeof response.arrayBuffer === 'function') {
      return Buffer.from(await response.arrayBuffer())
    }
  }

  if (stream && typeof stream === 'object' && Symbol.asyncIterator in stream) {
    const chunks: Buffer[] = []
    for await (const chunk of stream as AsyncIterable<Uint8Array | Buffer | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }

  if (stream && typeof stream === 'object' && 'getReader' in stream) {
    const reader = (stream as ReadableStream<Uint8Array>).getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    return Buffer.concat(chunks)
  }

  throw new Error('ElevenLabs returned an unexpected audio payload')
}

const SHARED_VOICE_CATEGORIES = new Set(['professional', 'famous', 'high_quality'])

function mapOwnedVoice(voice: {
  voiceId: string
  name?: string
  description?: string
  previewUrl?: string
  labels?: Record<string, string>
  verifiedLanguages?: Array<{ language?: string; accent?: string }>
}): UgcVoice {
  const labels = voice.labels ?? {}
  const verified = voice.verifiedLanguages?.[0]
  return {
    id: voice.voiceId,
    name: voice.name ?? 'Untitled voice',
    previewUrl: voice.previewUrl,
    description: voice.description,
    labels: {
      language: labels.language ?? verified?.language,
      gender: labels.gender,
      age: labels.age,
      accent: labels.accent ?? verified?.accent,
      useCase: labels.use_case ?? labels.useCase,
    },
  }
}

function mapSharedVoice(voice: {
  voiceId: string
  name?: string
  description?: string
  previewUrl?: string
  language?: string
  gender?: string
  age?: string
  accent?: string
  useCase?: string
}): UgcVoice {
  return {
    id: voice.voiceId,
    name: voice.name ?? 'Untitled voice',
    previewUrl: voice.previewUrl,
    description: voice.description,
    labels: {
      language: voice.language,
      gender: voice.gender,
      age: voice.age,
      accent: voice.accent,
      useCase: voice.useCase,
    },
  }
}

function dedupeVoices(groups: UgcVoice[][]): UgcVoice[] {
  const seen = new Set<string>()
  const voices: UgcVoice[] = []
  for (const group of groups) {
    for (const voice of group) {
      if (seen.has(voice.id)) continue
      seen.add(voice.id)
      voices.push(voice)
    }
  }
  return voices
}

export const generateTextToSpeech = async (input: GenerateTextToSpeechInput): Promise<Buffer> => {
  const { text, voice, model, speed, stability, similarity, style, speakerBoost } = input
  const audio = await getElevenLabsClient().textToSpeech.convert(
    voice,
    {
      text,
      modelId: model || DEFAULT_MODEL,
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: to01(stability, 0.5),
        similarityBoost: to01(similarity, 0.75),
        style: to01(style, 0),
        useSpeakerBoost: speakerBoost !== false,
        speed: typeof speed === 'number' ? Math.min(1.2, Math.max(0.7, speed)) : 1,
      },
    },
    { timeoutInSeconds: 60 },
  )
  const buffer = await streamToBuffer(audio)
  if (buffer.length === 0) {
    throw new Error('ElevenLabs returned empty audio')
  }
  return buffer
}

export const getVoices = async (input: GetVoicesInput = {}): Promise<GetVoicesResult> => {
  const result = await searchUgcVoices(input)
  return {
    voices: result.voices.map(voice => ({
      voice_id: voice.id,
      name: voice.name,
      labels: Object.entries(voice.labels).flatMap(([key, value]) => (value ? [`${key}:${value}`] : [])),
      description: voice.description ?? '',
      preview_url: voice.previewUrl ?? '',
    })),
    has_more: result.hasMore,
    next_page_token: result.nextPageToken,
  }
}

export const searchUgcVoices = async (input: GetVoicesInput = {}): Promise<SearchUgcVoicesResponse> => {
  const search = input.search || undefined
  const language = input.language || undefined
  const gender = input.gender || undefined
  const age = input.age || undefined
  const accent = input.accent || undefined
  const pageSize = input.pageSize ?? 40
  const sharedCategory =
    input.category && SHARED_VOICE_CATEGORIES.has(input.category)
      ? (input.category as 'professional' | 'famous' | 'high_quality')
      : undefined

  const client = getElevenLabsClient()
  const [ownedResult, sharedResult] = await Promise.allSettled([
    client.voices.search({
      search,
      language: language ? [language] : undefined,
      gender,
      age,
      accent,
      pageSize,
      nextPageToken: input.nextPageToken || undefined,
      includeTotalCount: false,
    }),
    client.voices.getShared({
      search,
      language,
      gender,
      age,
      accent,
      ...(sharedCategory ? { category: sharedCategory } : {}),
      pageSize,
      sort: 'trending',
    }),
  ])

  const owned = ownedResult.status === 'fulfilled' ? ownedResult.value : undefined
  const shared = sharedResult.status === 'fulfilled' ? sharedResult.value : undefined

  return {
    voices: dedupeVoices([
      (owned?.voices ?? []).map(mapOwnedVoice),
      (shared?.voices ?? []).map(mapSharedVoice),
    ]),
    hasMore: Boolean(owned?.hasMore || shared?.hasMore),
    nextPageToken: owned?.nextPageToken,
  }
}
