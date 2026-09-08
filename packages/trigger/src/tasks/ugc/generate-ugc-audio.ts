import { generateTextToSpeech } from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getUgcProjectById,
  updateUgcClip,
  UgcScriptSource,
  UgcVoiceProvider,
  type IUgcClip,
  type IUgcProject,
} from '@socialista/db'
import {
  appendUgcAudioTakes,
  estimateUgcSpokenDurationSec,
  TASK_IDS,
  UGC_DEFAULT_VOICE,
  ugcClipAudioTakes,
  ugcClipShowsScript,
  ugcResolvedClipVoice,
  type UgcClipAudioTake,
  type UgcClipType,
  type UgcClipVoice,
} from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcAudioPayloadSchema } from '../../schemas/generate-ugc-audio.schema.js'
import { uploadGeneratedAudio } from '../../services/audio-upload.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'

function asClipVoice(voice?: IUgcClip['voice']): UgcClipVoice | undefined {
  if (!voice?.provider) return undefined
  return {
    provider: 'elevenlabs',
    ...(voice.voiceId ? { voiceId: voice.voiceId } : {}),
    ...(voice.voiceName ? { voiceName: voice.voiceName } : {}),
    ...(typeof voice.speed === 'number' ? { speed: voice.speed } : {}),
    ...(typeof voice.stability === 'number' ? { stability: voice.stability } : {}),
    ...(typeof voice.similarity === 'number' ? { similarity: voice.similarity } : {}),
    ...(typeof voice.style === 'number' ? { style: voice.style } : {}),
    ...(typeof voice.speakerBoost === 'boolean' ? { speakerBoost: voice.speakerBoost } : {}),
    ...(typeof voice.enabled === 'boolean' ? { enabled: voice.enabled } : {}),
  }
}

function resolveVoice(project: IUgcProject, clip: IUgcClip): UgcClipVoice {
  return ugcResolvedClipVoice({ voice: asClipVoice(project.voice) }, { voice: asClipVoice(clip.voice) })
}

function clipScriptText(clip: IUgcClip, payloadText?: string, clipId?: string): string {
  if (clipId && clip.id === clipId && payloadText?.trim()) return payloadText.trim()
  return clip.script?.text.trim() ?? ''
}

function talkingClips(project: IUgcProject, clipId?: string): IUgcClip[] {
  const clips = project.clips ?? []
  const scoped = clipId ? clips.filter(clip => clip.id === clipId) : clips
  return scoped.filter(clip => ugcClipShowsScript(clip.type as UgcClipType))
}

export const generateUgcAudio = schemaTask({
  id: TASK_IDS.generateUgcAudio,
  schema: generateUgcAudioPayloadSchema,
  maxDuration: 180,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    try {
      await connectDb()
      const project = await getUgcProjectById(payload.projectId)
      if (!project) throw new Error('UGC project not found')

      const targets = talkingClips(project, payload.clipId)
      if (targets.length === 0) {
        throw new Error(payload.clipId ? 'Clip not found' : 'Add a talking scene first')
      }

      const speakable = targets.filter(clip => {
        const voice = resolveVoice(project, clip)
        return voice.enabled !== false && Boolean(clipScriptText(clip, payload.text, payload.clipId))
      })
      if (speakable.length === 0) {
        throw new Error(
          payload.clipId ? 'Write a script before generating audio' : 'Write a script on a talking scene first',
        )
      }

      let completed = 0
      const total = speakable.length
      let failed = 0

      for (const clip of speakable) {
        const voice = resolveVoice(project, clip)
        const text = clipScriptText(clip, payload.text, payload.clipId)
        const voiceId = voice.voiceId || UGC_DEFAULT_VOICE.voiceId
        if (!voiceId) {
          throw new Error('Pick a voice first')
        }

        setGenerationStatus(
          Math.round((completed / total) * 80),
          total === 1 ? 'Generating voiceover' : `Generating voiceover ${completed + 1} of ${total}`,
        )

        try {
          const audio = await generateTextToSpeech({
            text,
            voice: voiceId,
            speed: voice.speed,
            stability: voice.stability,
            similarity: voice.similarity,
            style: voice.style,
            speakerBoost: voice.speakerBoost,
          })

          setGenerationStatus(
            Math.round(((completed + 0.7) / total) * 90),
            'Saving voiceover',
          )

          const audioUrl = await uploadGeneratedAudio({
            workspaceId: payload.workspaceId,
            projectId: payload.projectId,
            clipId: clip.id,
            runId: ctx.run.id,
            bytes: audio,
          })

          const durationSec = estimateUgcSpokenDurationSec(text, voice.speed ?? 1)
          const take: UgcClipAudioTake = {
            id: `${ctx.run.id}:${clip.id}`,
            audioUrl,
            durationSec,
            scriptText: text,
          }
          const audioTakes = appendUgcAudioTakes(
            ugcClipAudioTakes({
              audioTakes: (clip.audioTakes ?? []).flatMap(item =>
                item.audioUrl
                  ? [
                      {
                        id: item.id,
                        audioUrl: item.audioUrl,
                        durationSec: item.durationSec,
                        scriptText: item.scriptText,
                      },
                    ]
                  : [],
              ),
              audioUrl: clip.audioUrl,
              audioDurationSec: clip.audioDurationSec,
            }),
            take,
          )

          await updateUgcClip(
            payload.projectId,
            clip.id,
            {
              script: {
                text,
                source: clip.script?.source ?? UgcScriptSource.USER,
              },
              audioUrl,
              audioDurationSec: durationSec,
              audioTakes,
              audioRunId: ctx.run.id,
              error: undefined,
              voice: {
                provider: UgcVoiceProvider.ELEVENLABS,
                voiceId,
                voiceName: voice.voiceName,
                speed: voice.speed,
                stability: voice.stability,
                similarity: voice.similarity,
                style: voice.style,
                speakerBoost: voice.speakerBoost,
                enabled: voice.enabled,
              },
            },
            { audioRunId: ctx.run.id, error: undefined },
          )
          completed += 1
        } catch (error) {
          failed += 1
          logger.error('UGC voiceover failed', { clipId: clip.id, error })
          await updateUgcClip(payload.projectId, clip.id, {
            error: error instanceof Error ? error.message : 'Voiceover failed',
          })
          if (payload.clipId) throw error
        }
      }

      if (failed > 0 && completed === 0) {
        throw new Error('Voiceover generation failed')
      }

      setGenerationStatus(100, failed > 0 ? 'Finished with errors' : 'Voiceover ready')
      return { projectId: payload.projectId, clipId: payload.clipId, generated: completed }
    } catch (error) {
      setGenerationFailure(error, 'Voiceover generation failed')
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateUgcAudioTask = typeof generateUgcAudio
