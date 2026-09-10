import { z } from "zod";

import { fal } from "../fal.js";
import {
  downloadRemoteVideo,
  uploadGeneratedVideo,
} from "../utils/video-upload.js";

const DEFAULT_MODEL = "fal-ai/sync-lipsync/v2";

const FalLipSyncResult = z
  .object({
    video: z.object({ url: z.string() }).optional(),
    video_url: z.string().optional(),
  })
  .refine((data) => Boolean(data.video?.url ?? data.video_url), {
    message: "No video was returned from the lip-sync model",
  });

/** How sync-lipsync reconciles mismatched audio/video durations. */
export type LipSyncMode = "cut_off" | "loop" | "bounce" | "silence" | "remap";

export type LipSyncInput = {
  videoUrl: string;
  audioUrl: string;
  /** Default 'cut_off' — output follows the shorter side, so the clip ends with the voiceover. */
  syncMode?: LipSyncMode;
  workspaceId?: string;
  userId?: string;
  onProgress?: (progress: number, label: string) => void;
};

function mapQueueStatus(
  status: string | undefined,
): { progress: number; label: string } | null {
  switch (status) {
    case "IN_QUEUE":
      return { progress: 50, label: "Waiting in queue" };
    case "IN_PROGRESS":
      return { progress: 65, label: "Lip-syncing" };
    case "COMPLETED":
      return { progress: 90, label: "Finalizing" };
    default:
      return null;
  }
}

export async function lipSync({
  videoUrl,
  audioUrl,
  syncMode = "cut_off",
  workspaceId,
  userId,
  onProgress,
}: LipSyncInput): Promise<string> {
  const result = await fal.subscribe(DEFAULT_MODEL, {
    // `model` is omitted on purpose: the v2 endpoint defaults to `lipsync-2` server-side,
    // while @fal-ai/client@1.10.1 types only allow stale v1 values.
    input: {
      video_url: videoUrl,
      audio_url: audioUrl,
      sync_mode: syncMode,
    },
    logs: true,
    onQueueUpdate: (update: unknown) => {
      const status =
        typeof update === "object" &&
        update !== null &&
        "status" in update &&
        typeof update.status === "string"
          ? mapQueueStatus(update.status)
          : null;
      if (status) {
        onProgress?.(status.progress, status.label);
      }
    },
  });

  const parsed = FalLipSyncResult.parse(result.data);
  const outputUrl = parsed.video?.url ?? parsed.video_url;
  if (!outputUrl) {
    throw new Error("No video was returned from the lip-sync model");
  }

  if (!workspaceId || !userId) {
    return outputUrl;
  }

  onProgress?.(90, "Saving to library");
  const downloaded = await downloadRemoteVideo(outputUrl);
  return uploadGeneratedVideo({
    workspaceId,
    userId,
    bytes: downloaded.bytes,
    mediaType: downloaded.mediaType,
  });
}
