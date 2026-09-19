import { UGC_TALKING_HEAD_MODEL_VALUE } from "@socialista/types";
import { z } from "zod";

import { fal } from "../fal.js";
import {
  downloadRemoteVideo,
  uploadGeneratedVideo,
} from "../utils/video-upload.js";

const FalTalkingHeadResult = z
  .object({
    video: z.object({ url: z.string() }).optional(),
    video_url: z.string().optional(),
  })
  .refine((data) => Boolean(data.video?.url ?? data.video_url), {
    message: "No video was returned from OmniHuman",
  });

export type GenerateUgcTalkingHeadInput = {
  prompt: string;
  imageUrl: string;
  audioUrl: string;
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
      return { progress: 65, label: "Animating talking head" };
    case "COMPLETED":
      return { progress: 90, label: "Finalizing" };
    default:
      return null;
  }
}

export async function generateUgcTalkingHead({
  prompt,
  imageUrl,
  audioUrl,
  workspaceId,
  userId,
  onProgress,
}: GenerateUgcTalkingHeadInput): Promise<string> {
  const result = await fal.subscribe(UGC_TALKING_HEAD_MODEL_VALUE, {
    input: {
      prompt,
      image_url: imageUrl,
      audio_url: audioUrl,
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

  const parsed = FalTalkingHeadResult.parse(result.data);
  const videoUrl = parsed.video?.url ?? parsed.video_url;
  if (!videoUrl) {
    throw new Error("No video was returned from OmniHuman");
  }

  if (!workspaceId || !userId) {
    return videoUrl;
  }

  onProgress?.(90, "Saving to library");
  const downloaded = await downloadRemoteVideo(videoUrl);
  return uploadGeneratedVideo({
    workspaceId,
    userId,
    bytes: downloaded.bytes,
    mediaType: downloaded.mediaType,
  });
}
