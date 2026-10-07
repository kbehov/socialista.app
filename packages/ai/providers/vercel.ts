import type {
  AspectRatio,
  GenerateImageOptions,
  GenerateVideoOptions,
} from "@socialista/types";
import { experimental_generateVideo as generateVideo, generateImage } from "ai";
import { uploadGeneratedImage } from "../utils/image-upload.js";
import { uploadGeneratedVideo } from "../utils/video-upload.js";

const SIZE_BASED_MODEL_PATTERN = /gpt-image|dall-e/i;

function aspectRatioToSize(aspectRatio: AspectRatio): `${number}x${number}` {
  switch (aspectRatio) {
    case "16:9":
    case "4:3":
      return "1536x1024";
    case "9:16":
      return "1024x1536";
    default:
      return "1024x1024";
  }
}

function usesImageSize(model: string): boolean {
  return SIZE_BASED_MODEL_PATTERN.test(model);
}

function referencePath(url: string): string {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function imageReferenceMediaType(url: string): "image/png" | "image/jpeg" | "image/webp" | "image/gif" {
  const path = referencePath(url);
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function videoReferenceMediaType(url: string): "video/mp4" | "video/webm" | "video/quicktime" | "video/ogg" {
  const path = referencePath(url);
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".ogv") || path.endsWith(".ogg")) return "video/ogg";
  return "video/mp4";
}

const WAN_MODEL_PATTERN = /wan/i;

const BILLED_VIDEO_FEATURES = new Set(["resolution", "duration"]);

// Pixel sizes for models that accept `{width}x{height}`. Wan models only accept tier strings.
function videoResolutionForModel(
  model: string,
  resolution: string | undefined,
): `${number}x${number}` {
  if (WAN_MODEL_PATTERN.test(model)) {
    const tier = resolution === "480p" ? "480P" : resolution === "1080p" ? "1080P" : "720P";
    return tier as `${number}x${number}`;
  }
  if (resolution === "480p") return "854x480";
  if (resolution === "1080p") return "1920x1080";
  return "1280x720";
}

export async function generateImageVercel({
  model,
  prompt,
  aspectRatio,
  workspaceId,
  userId,
  imageUrl,
  imageUrls,
  numImages = 1,
  onProgress,
}: GenerateImageOptions): Promise<string[]> {
  onProgress?.(65, "Rendering");

  const referenceImages = [
    ...(imageUrls ?? []),
    ...(imageUrl && !(imageUrls ?? []).includes(imageUrl) ? [imageUrl] : []),
  ];
  const promptArg =
    referenceImages.length > 0
      ? { text: prompt, images: referenceImages }
      : prompt;

  const promptText = typeof promptArg === "string" ? promptArg : promptArg.text;
  console.log("Submitting to Vercel AI", {
    model,
    aspectRatio,
    numImages,
    referenceCount: referenceImages.length,
    prompt: promptText,
  });

  const { images } = await generateImage(
    usesImageSize(model)
      ? {
          model,
          prompt: promptArg,
          n: numImages,
          maxImagesPerCall: numImages,
          size: aspectRatioToSize(aspectRatio),
        }
      : {
          model,
          prompt: promptArg,
          n: numImages,
          maxImagesPerCall: numImages,
          aspectRatio,
        },
  );

  if (images.length === 0) {
    throw new Error("No image was returned from the model");
  }

  onProgress?.(90, numImages > 1 ? "Uploading images" : "Uploading image");

  return Promise.all(
    images.slice(0, numImages).map((image) =>
      uploadGeneratedImage({
        workspaceId,
        userId,
        bytes: image.uint8Array,
        mediaType: image.mediaType,
      }),
    ),
  );
}

export async function generateVideoVercel({
  model,
  prompt,
  aspectRatio,
  workspaceId,
  userId,
  duration,
  generateAudio,
  resolution,
  imageUrl,
  imageUrls,
  videoUrls,
  onProgress,
}: GenerateVideoOptions): Promise<string> {
  onProgress?.(65, "Rendering");

  const referenceImages = [
    ...(imageUrls ?? []),
    ...(imageUrl && !(imageUrls ?? []).includes(imageUrl) ? [imageUrl] : []),
  ];
  const videoReferences = (videoUrls ?? []).map((url) => ({
    data: url,
    mediaType: videoReferenceMediaType(url),
  }));
  const hasVideoReference = videoReferences.length > 0;
  // A start-frame image forces image-to-video and drops the source clip.
  // With a video attached, every image and video goes through inputReferences.
  const inputReferences = hasVideoReference
    ? [
        ...videoReferences,
        ...referenceImages.map((url) => ({
          data: url,
          mediaType: imageReferenceMediaType(url),
        })),
      ]
    : referenceImages.slice(1);

  const promptArg =
    !hasVideoReference && referenceImages.length > 0
      ? { text: prompt, image: referenceImages[0]! }
      : prompt;
  const size = videoResolutionForModel(model, resolution);

  console.log("Submitting video to Vercel AI", {
    model,
    aspectRatio,
    duration,
    generateAudio,
    resolution: size,
    mode: hasVideoReference
      ? "reference-to-video"
      : referenceImages.length > 0
        ? "image-to-video"
        : "text-to-video",
    referenceCount: referenceImages.length + videoReferences.length,
    videoCount: videoReferences.length,
  });

  const { video, warnings } = await generateVideo({
    model,
    prompt: promptArg,
    aspectRatio,
    resolution: size,
    ...(typeof duration === "number" ? { duration } : {}),
    generateAudio,
    ...(inputReferences.length > 0 ? { inputReferences } : {}),
  });

  const ignoredBilledSettings = warnings.flatMap((warning) =>
    warning.type === "unsupported" && BILLED_VIDEO_FEATURES.has(warning.feature)
      ? [warning]
      : [],
  );
  if (ignoredBilledSettings.length > 0) {
    const summary = ignoredBilledSettings
      .map((warning) => warning.details ?? `${warning.feature} was ignored`)
      .join("; ");
    throw new Error(`Vercel ignored billed video settings: ${summary}`);
  }

  if (warnings.length > 0) {
    console.log("Video generation warnings", warnings);
  }

  if (!video?.uint8Array?.length) {
    throw new Error("No video was returned from the model");
  }

  onProgress?.(90, "Saving to library");

  return uploadGeneratedVideo({
    workspaceId,
    userId,
    bytes: video.uint8Array,
    mediaType: video.mediaType || "video/mp4",
  });
}
