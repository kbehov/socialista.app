import {
  PRESET_DESCRIPTION_MAX_LENGTH,
  PRESET_NAME_MAX_LENGTH,
  PRESET_PROMPT_MAX_LENGTH,
  PresetKind,
  type CreatePresetPayload,
} from '@socialista/types'

type PresetSeed = Required<Pick<CreatePresetPayload, 'kind' | 'name' | 'description' | 'prompt' | 'image'>> & {
  attachments: NonNullable<CreatePresetPayload['attachments']>
  sortOrder: number
  active: true
}

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&h=1200&q=80`
}

/**
 * Ready-to-generate 2026 social formats.
 * Image/video prompts are specification-dense so a click can run.
 * Slideshow prompts follow hook / format / audience / voice so the planner lands a save-worthy deck.
 */
export const PRESET_SEEDS: readonly PresetSeed[] = [
  // ── Images — feed stills that still earn saves in 2026 ───────────
  {
    kind: PresetKind.IMAGE,
    name: 'Photo dump',
    description: 'Candid film still — the 2026 feed look people save, not a studio portrait.',
    prompt:
      'candid 35mm photo-dump still, young woman on a sunlit apartment stoop, slightly off-center, mid-laugh, wrinkled linen shirt, paper coffee cup in one hand, 50mm, available golden-hour side light, slight window overexposure, film grain and a faint light leak at the top edge, lived-in color, Instagram photo-dump cover',
    image: unsplash('photo-1529626455594-4ff0802cfb7e'),
    attachments: [],
    sortOrder: 0,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'Quiet luxury',
    description: 'Soft-life still life — cream, stone, one object. Quiet luxury is still the 2026 default.',
    prompt:
      'quiet-luxury still life, matte ceramic mug and a thin gold chain on honed travertine, one crumpled linen napkin, 50mm slight overhead, hard window light from the left, long shadows, cream stone and warm metal palette, editorial Instagram still',
    image: unsplash('photo-1515562141207-7a88fb7ce338'),
    attachments: [],
    sortOrder: 1,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'Street OOTD',
    description: 'Street-style OOTD — full look, real sidewalk, not a lookbook studio.',
    prompt:
      'street-style OOTD, young woman walking a city sidewalk mid-stride, oversized blazer over a tank, vintage denim, 35mm at chest height, slight motion in the coat hem, late-afternoon sun, long sidewalk shadows, real storefronts behind, fashion Instagram energy',
    image: unsplash('photo-1529139574466-a303027c1d8b'),
    attachments: [],
    sortOrder: 2,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'UGC hold',
    description: 'Phone-native product hold — the still that still converts as a Reel cover.',
    prompt:
      'UGC iPhone still, creator holding a matte glass serum bottle toward camera at arm’s length, label square and readable, real bathroom vanity clutter behind, vanity-bulb light, mild wide-angle selfie distortion, natural skin texture, vertical Stories crop, product large in the foreground',
    image: unsplash('photo-1620916566398-39f1143ab7be'),
    attachments: [],
    sortOrder: 3,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'Flash film',
    description: 'On-camera flash, compact-camera energy — still a 2026 fashion default.',
    prompt:
      'on-camera flash fashion still, young woman in a small apartment hallway, direct flash from a compact digital camera, hard shadow on the wall behind, slightly blown highlights on skin, compact-camera color, 28mm, fashion-girl Instagram flash photo',
    image: unsplash('photo-1469334031218-e382a71b716b'),
    attachments: [],
    sortOrder: 4,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'Food still',
    description: 'Overhead food still — save-worthy, slightly messy, not restaurant catalog.',
    prompt:
      'overhead food still, a slightly messy brunch plate on a worn wood table, jam smear, torn bread, a linen napkin off-center, 50mm top-down, window light from the left, real crumbs, warm editorial food Instagram',
    image: unsplash('photo-1540189549336-e6e99c3679fe'),
    attachments: [],
    sortOrder: 5,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'Morning ritual',
    description: 'Morning-ritual lifestyle — coffee and skincare on a real counter.',
    prompt:
      'morning-ritual lifestyle still, hands pouring coffee beside a glass dropper serum on a marble apartment counter, steam rising, 50mm at counter height, soft window light, real apartment kitchen behind, warm cream palette, wellness Instagram',
    image: unsplash('photo-1495474472287-4d71bcdd2085'),
    attachments: [],
    sortOrder: 6,
    active: true,
  },
  {
    kind: PresetKind.IMAGE,
    name: 'Product hero',
    description: 'PDP-style product hero — pack fills the frame, one unexpected set piece.',
    prompt:
      'product-hero still, matte glass serum bottle filling the frame on honed travertine, one unexpected sprig of rosemary, 50mm slight overhead, hard side light, controlled speculars, true color, luxury ecommerce photography, feed-ready',
    image: unsplash('photo-1556228720-195a672e8a03'),
    attachments: [],
    sortOrder: 7,
    active: true,
  },

  // ── Videos — 2026 Reels / TikTok formats that convert ────────────────
  {
    kind: PresetKind.VIDEO,
    name: 'Talking hook',
    description: 'Talking-head UGC — hands busy, delayed product, the 2026 scroll-stop.',
    prompt:
      'young woman at a real kitchen island, mid chopping parsley, looks up at a phone on a stand, handheld micro-sway, available kitchen light, she says "I stopped buying the expensive one", then lifts a drugstore serum toward camera so the label is readable, mild phone grain, vertical UGC talking-head',
    image: unsplash('photo-1556911220-bff31c812dba'),
    attachments: [],
    sortOrder: 0,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'GRWM',
    description: 'GRWM at a real vanity — still the highest-converting beauty format.',
    prompt:
      'GRWM at a real bathroom vanity, young woman applying a dewy blush with her fingers, looking into a mirror then glancing at the phone, handheld micro-sway, bathroom-bulb plus window light, cluttered counter with other products, she says "this is the step that actually changed my face", vertical get-ready-with-me',
    image: unsplash('photo-1487412720507-e7ab37603c6f'),
    attachments: [],
    sortOrder: 1,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'ASMR pour',
    description: 'Slowed-down product ASMR — high completion from texture, not a pitch.',
    prompt:
      'extreme close-up of a glass dropper releasing a honey-thick serum onto fingertips, slow continuous pour, 100mm macro, shallow depth, bathroom window light, viscous strands catching the light, quiet room tone, liquid tick, satisfying product ASMR',
    image: unsplash('photo-1608571423902-eed4a5ad8108'),
    attachments: [],
    sortOrder: 2,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'POV try-on',
    description: 'First-person POV try-on — mirror, over-shoulder, converts apparel and beauty.',
    prompt:
      'first-person POV in a bedroom mirror, hands applying a glossy lip tint, iPhone front-camera slightly wide, real bedroom behind the mirror, window light, she tilts her chin and checks the color, slight handheld sway, she says "wait this is actually the one", vertical POV try-on',
    image: unsplash('photo-1522335789203-aabd1fc54bc9'),
    attachments: [],
    sortOrder: 3,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'Product push-in',
    description: 'Cinematic product push-in — Reels watch time is up; this is the discovery clip.',
    prompt:
      'matte glass serum bottle on honed travertine, slow push-in, 50mm eye-level, hard side light, a ribbon of steam drifting through the beam, label staying readable, luxury product commercial energy, quiet room tone',
    image: unsplash('photo-1611930022073-b7a4ba5fcccd'),
    attachments: [],
    sortOrder: 4,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'Hands demo',
    description: 'Faceless hands-only demo — texture and swatch content that outconverts face-cam.',
    prompt:
      'overhead hands-only demo, two hands pressing a thick cream into skin on a real bathroom counter, cream catching the light, 50mm, window light from the left, product jar visible at the edge of frame, quiet fabric and cream sound, faceless UGC demo',
    image: unsplash('photo-1556228578-8c89e6adf883'),
    attachments: [],
    sortOrder: 5,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'Day-in-life',
    description: 'Day-in-the-life in one beat — coffee, window light, a look to camera.',
    prompt:
      'young woman in a linen shirt at a sunlit kitchen window, turns toward camera and smiles, steam drifting from a mug, slow push-in, handheld micro-sway, eye-level medium shot, soft morning window light from the left, quiet room tone, fabric rustle, she says "this changed everything"',
    image: unsplash('photo-1494790108377-be9c29b29330'),
    attachments: [],
    sortOrder: 6,
    active: true,
  },
  {
    kind: PresetKind.VIDEO,
    name: 'Unboxing',
    description: 'Real-desk unboxing — messy paper, readable pack, native UGC.',
    prompt:
      'overhead phone video of hands opening a brown shipping box on a real desk, crumpled paper, a matte serum bottle emerging label-readable, slight handheld sway, available indoor light, cardboard rustle, she says "okay wait", UGC unboxing',
    image: unsplash('photo-1556742049-0cfed4f6a45d'),
    attachments: [],
    sortOrder: 7,
    active: true,
  },

  // ── Slideshows — Instagram carousels (9x saves vs single image) ────
  {
    kind: PresetKind.SLIDESHOW,
    name: '30-day story',
    description: 'Personal 30-day story carousel — Instagram’s 2026 save engine.',
    prompt:
      'I used this $14 drugstore serum for 30 days and nobody talks about what happened, a 7-slide story for women 22–32 who already try too many products, first person until the lesson then switch to you, end on save this so they can come back to it',
    image: unsplash('photo-1570172619644-dfd03ed5d881'),
    attachments: [],
    sortOrder: 0,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Save this list',
    description: 'Numbered list carousel — the format Instagram reshows and people bookmark.',
    prompt:
      '7 things that quietly ruined my skin this year, a save-worthy list carousel for people who buy too many products, second person, one punchy specific item per slide, no CTA unless it earns the ending, the number in the hook must match the items',
    image: unsplash('photo-1484480974693-6ca0a78fb36b'),
    attachments: [],
    sortOrder: 1,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Myth vs fact',
    description: 'Myth-busting carousel — contrarian hook, then what to do instead.',
    prompt:
      "everyone says you need a 10-step routine. they're wrong, a 6-slide myth-bust for people overwhelmed by skincare, acknowledge why they believe it, then the real approach, end on what to do instead",
    image: unsplash('photo-1454165804606-c3d57bc86b40'),
    attachments: [],
    sortOrder: 2,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Step-by-step',
    description: 'How-to guide carousel — lived experience, not a corporate tutorial.',
    prompt:
      'stop layering vitamin C like that if you want it to actually work, a 7-slide guide for people whose serums do nothing, biggest mistake first then 3 specific steps with a common pitfall, second person, skip a CTA unless it fits',
    image: unsplash('photo-1434030216411-0b793f4b4173'),
    attachments: [],
    sortOrder: 3,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Morning stack',
    description: 'Habit-stack routine carousel — times, amounts, a real result.',
    prompt:
      'I did this 6-minute morning stack every day for 30 days, a 6-slide routine for tired people who cannot do a 45-minute wellness ritual, specific times and amounts, first person on the hook then you on the result, save this routine if it earns the ending',
    image: unsplash('photo-1544367567-0f2fcb009e0b'),
    attachments: [],
    sortOrder: 4,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Us vs them',
    description: 'Comparison carousel — what most people do vs what actually works.',
    prompt:
      'cheap serum vs the $86 one — most people pick wrong, a 6-slide comparison for people who upgrade products instead of technique, break down both sides, verdict with a reason, ask them to comment if they want to argue the pick',
    image: unsplash('photo-1556740758-90de374c12ad'),
    attachments: [],
    sortOrder: 5,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Wish I knew',
    description: 'Things-I-wish-I-knew story — the carousel people send to a friend.',
    prompt:
      'things I wish I knew before quitting my job to freelance, a 6-slide story for people stuck in a job they outgrew, first person through the turning point then you on the lesson, specific numbers, end on save this for the week you want to quit',
    image: unsplash('photo-1522202176988-66273c2fd55f'),
    attachments: [],
    sortOrder: 6,
    active: true,
  },
  {
    kind: PresetKind.SLIDESHOW,
    name: 'Hot take',
    description: 'Unpopular-opinion carousel — polarizing hook, comments and shares.',
    prompt:
      'posting every day is the reason your account is stuck, a 6-slide hot take for creators under 10k, contrarian hook, why people believe the opposite, what to do instead, invite a comment with the word batch',
    image: unsplash('photo-1516321318423-f06f85e504b3'),
    attachments: [],
    sortOrder: 7,
    active: true,
  },
]

export function assertPresetSeeds(): void {
  for (const seed of PRESET_SEEDS) {
    if (seed.name.length > PRESET_NAME_MAX_LENGTH) {
      throw new Error(`Preset name exceeds ${PRESET_NAME_MAX_LENGTH}: ${seed.name}`)
    }
    if (seed.description.length > PRESET_DESCRIPTION_MAX_LENGTH) {
      throw new Error(`Preset description exceeds ${PRESET_DESCRIPTION_MAX_LENGTH}: ${seed.name}`)
    }
    if (seed.prompt.length > PRESET_PROMPT_MAX_LENGTH) {
      throw new Error(`Preset prompt exceeds ${PRESET_PROMPT_MAX_LENGTH}: ${seed.name}`)
    }
  }
}
