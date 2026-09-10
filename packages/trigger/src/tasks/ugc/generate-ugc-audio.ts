import { generateTextToSpeech } from "@socialista/ai";
import {
  connectDb,
  disconnectDb,
  getUgcProjectById,
  updateUgcClip,
  UgcScriptSource,
  UgcVoiceProvider,
  type IUgcClip,
  type IUgcProject,
} from "@socialista/db";
import {
  appendUgcAudioTakes,
  estimateUgcSpokenDurationSec,
  TASK_IDS,
  UGC_DEFAULT_VOICE,
  ugcClipAudioTakes,
  ugcClipGeneratesAudio,
  ugcResolvedClipVoice,
  type UgcClipAudioTake,
  type UgcClipType,
  type UgcClipVoice,
} from "@socialista/types";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { generateUgcAudioPayloadSchema } from "../../schemas/generate-ugc-audio.schema.js";
import { uploadGeneratedAudio } from "../../services/audio-upload.js";
import { probeMediaDurationSec } from "../../services/video-export/ffmpeg.js";
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from "../shared/generation-record.js";
import {
  setGenerationFailure,
  setGenerationStatus,
} from "../shared/metadata.js";
import {
  assertSufficientCredits,
  finalizeGeneration,
  loadModelAndWorkspace,
} from "../shared/workspace.js";

function asClipVoice(voice?: IUgcClip["voice"]): UgcClipVoice | undefined {
  if (!voice?.provider) return undefined;
  return {
    provider: voice.provider as UgcClipVoice["provider"],
    ...(voice.voiceId ? { voiceId: voice.voiceId } : {}),
    ...(voice.voiceName ? { voiceName: voice.voiceName } : {}),
    ...(typeof voice.speed === "number" ? { speed: voice.speed } : {}),
    ...(typeof voice.stability === "number"
      ? { stability: voice.stability }
      : {}),
    ...(typeof voice.similarity === "number"
      ? { similarity: voice.similarity }
      : {}),
    ...(typeof voice.style === "number" ? { style: voice.style } : {}),
    ...(typeof voice.speakerBoost === "boolean"
      ? { speakerBoost: voice.speakerBoost }
      : {}),
    ...(typeof voice.enabled === "boolean" ? { enabled: voice.enabled } : {}),
  };
}

function resolveVoice(project: IUgcProject, clip: IUgcClip): UgcClipVoice {
  return ugcResolvedClipVoice(
    { voice: asClipVoice(project.voice) },
    { voice: asClipVoice(clip.voice) },
  );
}

function clipScriptText(
  clip: IUgcClip,
  payloadText?: string,
  clipId?: string,
): string {
  if (clipId && clip.id === clipId && payloadText?.trim())
    return payloadText.trim();
  return clip.script?.text.trim() ?? "";
}

function talkingClips(project: IUgcProject, clipId?: string): IUgcClip[] {
  const clips = project.clips ?? [];
  const scoped = clipId ? clips.filter((clip) => clip.id === clipId) : clips;
  return scoped.filter((clip) =>
    ugcClipGeneratesAudio(clip.type as UgcClipType),
  );
}

function resolveAudioModelValue(project: IUgcProject, clip: IUgcClip): string {
  return clip.models?.script || project.models.script || project.models.video;
}

/** Probe the real duration of generated TTS bytes; fall back to the script-based estimate. */
async function measureAudioDurationSec(
  bytes: Uint8Array,
  fallbackSec: number,
): Promise<number> {
  const workDir = await mkdtemp(join(tmpdir(), "ugc-audio-probe-"));
  try {
    const audioPath = join(workDir, "audio.mp3");
    await writeFile(audioPath, bytes);
    const probed = await probeMediaDurationSec(audioPath);
    if (probed) return Math.round(probed * 10) / 10;
    return fallbackSec;
  } catch (error) {
    logger.warn("Could not probe voiceover duration, using estimate", {
      error,
    });
    return fallbackSec;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export const generateUgcAudio = schemaTask({
  id: TASK_IDS.generateUgcAudio,
  schema: generateUgcAudioPayloadSchema,
  maxDuration: 180,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    try {
      await connectDb();
      const project = await getUgcProjectById(payload.projectId);
      if (!project) throw new Error("UGC project not found");

      const targets = talkingClips(project, payload.clipId);
      if (targets.length === 0) {
        throw new Error(
          payload.clipId ? "Clip not found" : "Add a scene with a script first",
        );
      }

      const speakable = targets.filter((clip) => {
        const voice = resolveVoice(project, clip);
        return (
          voice.enabled !== false &&
          Boolean(clipScriptText(clip, payload.text, payload.clipId))
        );
      });
      if (speakable.length === 0) {
        throw new Error(
          payload.clipId
            ? "Write a script before generating audio"
            : "Write a script first",
        );
      }

      const pending = payload.clipId
        ? speakable
        : speakable.filter((clip) => !clip.audioUrl);
      if (pending.length === 0) {
        setGenerationStatus(100, "Voiceover ready");
        return {
          projectId: payload.projectId,
          clipId: payload.clipId,
          generated: 0,
        };
      }

      let completed = 0;
      const total = pending.length;
      let failed = 0;

      for (const clip of pending) {
        const voice = resolveVoice(project, clip);
        const text = clipScriptText(clip, payload.text, payload.clipId);
        const voiceId = voice.voiceId || UGC_DEFAULT_VOICE.voiceId;
        if (!voiceId) {
          throw new Error("Pick a voice first");
        }

        const modelValue = resolveAudioModelValue(project, clip);
        const { model, workspace } = await loadModelAndWorkspace(
          modelValue,
          payload.workspaceId,
        );
        assertSufficientCredits(workspace, model.cost);

        const triggerRunId = `${ctx.run.id}:${clip.id}`;
        const started = await startGenerationRecord({
          kind: GenerationKind.VIDEO,
          taskId: TASK_IDS.generateUgcAudio,
          triggerRunId,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          projectId: project.project?.toString(),
          prompt: text,
          model,
          inputs: {
            ugcProjectId: payload.projectId,
            ugcClipId: clip.id,
            durationSec: estimateUgcSpokenDurationSec(text, voice.speed ?? 1),
          },
        });

        setGenerationStatus(
          Math.round((completed / total) * 80),
          total === 1
            ? "Generating voiceover"
            : `Generating voiceover ${completed + 1} of ${total}`,
        );

        try {
          const audio = await generateTextToSpeech({
            text,
            voice: voiceId,
            speed: voice.speed,
            stability: voice.stability,
            similarity: voice.similarity,
            style: voice.style,
            speakerBoost: voice.speakerBoost,
          });

          setGenerationStatus(
            Math.round(((completed + 0.7) / total) * 90),
            "Saving voiceover",
          );

          const audioUrl = await uploadGeneratedAudio({
            workspaceId: payload.workspaceId,
            projectId: payload.projectId,
            clipId: clip.id,
            runId: ctx.run.id,
            bytes: audio,
          });

          const durationSec = await measureAudioDurationSec(
            audio,
            estimateUgcSpokenDurationSec(text, voice.speed ?? 1),
          );
          const take: UgcClipAudioTake = {
            id: `${ctx.run.id}:${clip.id}`,
            audioUrl,
            durationSec,
            scriptText: text,
          };
          const audioTakes = appendUgcAudioTakes(ugcClipAudioTakes(clip), take);

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
          );

          await finalizeGeneration(payload.workspaceId, model);
          await completeGenerationRecord({
            triggerRunId,
            result: {
              type: GenerationResultType.FILE,
              url: audioUrl,
              durationSec,
              mimeType: "audio/mpeg",
            },
            cost: model.cost,
            startedAt: started.startedAt,
          });
          completed += 1;
        } catch (error) {
          await failGenerationRecord({
            triggerRunId,
            error,
            startedAt: started.startedAt,
          }).catch(() => undefined);
          failed += 1;
          logger.error("UGC voiceover failed", { clipId: clip.id, error });
          await updateUgcClip(payload.projectId, clip.id, {
            error: error instanceof Error ? error.message : "Voiceover failed",
          });
          if (payload.clipId) throw error;
        }
      }

      if (failed > 0 && completed === 0) {
        throw new Error("Voiceover generation failed");
      }

      setGenerationStatus(
        100,
        failed > 0 ? "Finished with errors" : "Voiceover ready",
      );
      return {
        projectId: payload.projectId,
        clipId: payload.clipId,
        generated: completed,
      };
    } catch (error) {
      setGenerationFailure(error, "Voiceover generation failed");
      throw error as Error;
    } finally {
      await disconnectDb();
    }
  },
});
