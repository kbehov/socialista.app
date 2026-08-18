import {
  SKILL_BINDINGS,
  SKILL_SLOTS,
  SYSTEM_CATEGORY_SLUGS,
  type SkillSlot,
  type SystemCategoryDefinition,
  type SystemSkillDefinition,
} from '@socialista/types'

import { POST_COPYWRITING_SYSTEM } from '../prompts/copywriting.js'
import { generateImagePromptSystemMessage } from '../prompts/image-prompts.js'
import { SLIDESHOW_SYSTEM_PROMPT } from '../prompts/slideshow-prompt.js'
import { staticAdVisionSystemPrompt } from '../prompts/static-ad-prompts.js'
import { UGC_SCENE_STILL_SYSTEM } from '../prompts/ugc-scene-still-prompt.js'
import { UGC_VIDEO_PLANNER_SYSTEM } from '../prompts/ugc-video-planner-prompt.js'
import { generateVideoPromptSystemMessage } from '../prompts/video-prompts.js'
import { VIDEO_SCRIPT_SYSTEM_PROMPT } from '../prompts/video-script-prompt.js'
import { CATALOG_SKILLS } from './catalog-skills.js'

const UGC_AD_SCRIPT_SKILL_CONTENT = `
You write short spoken UGC ad scripts for TikTok / Reels / Shorts.

Rules:
- First person, peer-to-peer, like a real creator talking to their phone.
- Hook first. One proof beat. One clear CTA.
- Hard limit: {{targetChars}} characters including spaces. {{durationSec}} seconds when spoken. Contractions. No hashtags, emojis, or markdown.
- Never say "game-changer", "unlock", "in today's fast-paced world", or "as an AI".
- If a product name is given, use it once naturally. Do not invent medical or income claims.
`.trim()

export const SYSTEM_CATEGORIES: SystemCategoryDefinition[] = [
  {
    slug: SYSTEM_CATEGORY_SLUGS.productEcommerce,
    name: 'Product & E-commerce',
    description: 'Studio, lifestyle, flat-lay, and comparison shots for selling products.',
    sortOrder: 0,
  },
  {
    slug: SYSTEM_CATEGORY_SLUGS.socialAds,
    name: 'Social & Ad Formats',
    description: 'UGC stills, static ads, covers, and short-form video planning.',
    sortOrder: 1,
  },
  {
    slug: SYSTEM_CATEGORY_SLUGS.brandIdentity,
    name: 'Brand & Identity',
    description: 'Logo mockups, palette scenes, and packaging visuals.',
    sortOrder: 2,
  },
  {
    slug: SYSTEM_CATEGORY_SLUGS.influencerPersona,
    name: 'AI Influencer / Persona',
    description: 'Portrait, product-context, outfit, and expression skills for personas.',
    sortOrder: 3,
  },
  {
    slug: SYSTEM_CATEGORY_SLUGS.seasonalCampaign,
    name: 'Seasonal & Campaign',
    description: 'Holiday overlays, promo badges, and event-themed backgrounds.',
    sortOrder: 4,
  },
  {
    slug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    name: 'Editorial & Content',
    description: 'Hero images, thumbnails, captions, slideshows, and scripts.',
    sortOrder: 5,
  },
  {
    slug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    name: 'Restyle & Enhancement',
    description: 'Background swap, upscale, style transfer, color match, and prompt enhance.',
    sortOrder: 6,
  },
]

const SLOT_SKILLS: SystemSkillDefinition[] = [
  {
    slug: SKILL_SLOTS.imagePromptEnhance,
    name: 'Image prompt enhance',
    description:
      'Converts a user request into a production-ready text-to-image prompt for Flux, Seedream, GPT Image, and similar models.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    binding: SKILL_BINDINGS.image,
    slot: SKILL_SLOTS.imagePromptEnhance,
    content: generateImagePromptSystemMessage.trim(),
    modelConfig: { model: 'openai/gpt-5.6-terra' },
  },
  {
    slug: SKILL_SLOTS.videoPromptEnhance,
    name: 'Video prompt enhance',
    description:
      'Converts a user request into a production-ready text-to-video prompt for Kling, Veo, Seedance, and similar models.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    binding: SKILL_BINDINGS.video,
    slot: SKILL_SLOTS.videoPromptEnhance,
    content: generateVideoPromptSystemMessage.trim(),
    modelConfig: { model: 'openai/gpt-5.6-terra' },
  },
  {
    slug: SKILL_SLOTS.staticAdVision,
    name: 'Static ad vision',
    description:
      'Turns a product photo and optional marketer notes into a scroll-stopping Meta static-ad image-edit prompt.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    binding: SKILL_BINDINGS.image,
    slot: SKILL_SLOTS.staticAdVision,
    content: staticAdVisionSystemPrompt,
    modelConfig: { model: 'openai/gpt-5.6-sol' },
  },
  {
    slug: SKILL_SLOTS.ugcVideoPlanner,
    name: 'UGC video planner',
    description:
      'Writes an image-to-video production prompt from a start-frame still, spoken script, and clip directions.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    binding: SKILL_BINDINGS.video,
    slot: SKILL_SLOTS.ugcVideoPlanner,
    content: UGC_VIDEO_PLANNER_SYSTEM,
    modelConfig: { temperature: 0.7 },
  },
  {
    slug: SKILL_SLOTS.ugcAdScript,
    name: 'UGC ad script',
    description: 'Writes a short first-person spoken UGC ad script for TikTok / Reels / Shorts.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    binding: SKILL_BINDINGS.text,
    slot: SKILL_SLOTS.ugcAdScript,
    content: UGC_AD_SCRIPT_SKILL_CONTENT,
    variables: [
      {
        key: 'durationSec',
        label: 'Duration (seconds)',
        type: 'number',
        required: false,
        defaultValue: 8,
      },
      {
        key: 'targetChars',
        label: 'Character budget',
        type: 'number',
        required: false,
        defaultValue: 80,
      },
    ],
    modelConfig: { temperature: 0.85 },
  },
  {
    slug: SKILL_SLOTS.ugcSceneStill,
    name: 'UGC scene still',
    description: 'Seeds a photoreal UGC still that becomes the start frame of a short-form video.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    binding: SKILL_BINDINGS.image,
    slot: SKILL_SLOTS.ugcSceneStill,
    content: UGC_SCENE_STILL_SYSTEM,
  },
  {
    slug: SKILL_SLOTS.videoScript,
    name: 'Video script',
    description: 'Turns a content description into timed on-screen caption segments for short-form video.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    binding: SKILL_BINDINGS.text,
    slot: SKILL_SLOTS.videoScript,
    content: VIDEO_SCRIPT_SYSTEM_PROMPT.trim(),
    modelConfig: { model: 'anthropic/claude-sonnet-4.6', temperature: 0.8 },
  },
  {
    slug: SKILL_SLOTS.slideshow,
    name: 'Slideshow copy',
    description: 'Turns a topic or hook into swipe-through TikTok slideshow copy.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    binding: SKILL_BINDINGS.text,
    slot: SKILL_SLOTS.slideshow,
    content: SLIDESHOW_SYSTEM_PROMPT.trim(),
    modelConfig: { model: 'anthropic/claude-sonnet-4.6', temperature: 0.85 },
  },
  {
    slug: SKILL_SLOTS.postCopywriter,
    name: 'Post copywriter',
    description: 'Turns a brief and optional visuals into one social caption ready to post.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    binding: SKILL_BINDINGS.text,
    slot: SKILL_SLOTS.postCopywriter,
    content: POST_COPYWRITING_SYSTEM.trim(),
    modelConfig: { model: 'openai/gpt-5.6-luna', temperature: 0.92 },
  },
]

export const SYSTEM_SKILLS: SystemSkillDefinition[] = [...SLOT_SKILLS, ...CATALOG_SKILLS]

const SYSTEM_SKILL_BY_SLOT = new Map<SkillSlot, SystemSkillDefinition>(
  SYSTEM_SKILLS.flatMap(skill => (skill.slot ? [[skill.slot, skill] as const] : [])),
)

export function getSystemSkillBySlot(slot: SkillSlot): SystemSkillDefinition | undefined {
  return SYSTEM_SKILL_BY_SLOT.get(slot)
}
