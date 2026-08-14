import {
  INFLUENCER_GENERATION_SHOT_MAX,
  INFLUENCER_GENERATION_SHOT_MIN,
} from "@socialista/types";
import { z } from "zod";

export const generateInfluencerPayloadSchema = z.object({
  influencerId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  model: z.string().min(1),
  shotCount: z
    .number()
    .int()
    .min(INFLUENCER_GENERATION_SHOT_MIN)
    .max(INFLUENCER_GENERATION_SHOT_MAX)
    .optional(),
});

export type GenerateInfluencerPayload = z.infer<
  typeof generateInfluencerPayloadSchema
>;
