export type GenerationWaitingKind = 'image' | 'video' | 'ad'

const IMAGE_WAITING = [
  'Razzle-dazzling the pixels',
  'Consulting the mood board',
  'Checking if this slaps',
  'Teaching the model about taste',
  'Stirring the color pot',
  'Negotiating with the muse',
  'Applying main-character energy',
  'Hunting for good lighting',
  'Making it feed-worthy',
  'Simmering the aesthetic',
  'Asking the algorithm nicely',
  'Caffeinating the render queue',
  'Scouting the perfect angle',
  'Polishing the visual sauce',
  'Removing accidental thumb',
  'Adding subtle drama (tastefully)',
  'Vibes-checking the composition',
  'Almost certainly not a stock photo',
] as const

const VIDEO_WAITING = [
  'Rolling imaginary b-roll',
  'Teaching pixels to move with purpose',
  'Chasing the perfect frame rate',
  'Storyboarding in our heads',
  'Adding cinematic gravitas',
  'Negotiating with the timeline',
  'Warming up the render farm',
  'Checking continuity (emotionally)',
  'Almost ready for your close-up',
  'Stirring the motion blur',
  'Cueing the subtle whoosh',
  'Making it feel expensive',
  'Rendering good vibes per second',
  'Polishing the opening shot',
  'Syncing the vibe to the beat',
  'Finding the money shot',
] as const

const AD_WAITING = [
  'Channeling conversion energy',
  'Measuring pixels in CTR',
  'Polishing the product hero',
  'Making the CTA irresistible',
  'A/B testing in our hearts',
  'Sharpening the value prop',
  'Consulting the brand guidelines (vibes edition)',
  'Squaring the creative for every feed',
  'Removing discount-code chaos',
  'Adding just enough urgency',
  'Teaching AI what "click" means',
  'Balancing logo and drama',
  'Stress-testing the headline',
  'Making the product the main character',
] as const

const IMAGE_CONNECTING = [
  'Linking to your generation',
  'Warming up the studio',
  'Finding where we left the pixels',
  'Connecting the creative wires',
] as const

const VIDEO_CONNECTING = [
  'Linking to your video render',
  'Finding the playback head',
  'Connecting to the timeline',
  'Warming up the encoder',
] as const

const AD_CONNECTING = [
  'Linking to your ad run',
  'Warming up the campaign lab',
  'Connecting creative to canvas',
  'Fetching the product glow',
] as const

export const GENERATION_WAITING_LINES: Record<GenerationWaitingKind, readonly string[]> = {
  image: IMAGE_WAITING,
  video: VIDEO_WAITING,
  ad: AD_WAITING,
}

export const GENERATION_CONNECTING_LINES: Record<GenerationWaitingKind, readonly string[]> = {
  image: IMAGE_CONNECTING,
  video: VIDEO_CONNECTING,
  ad: AD_CONNECTING,
}
