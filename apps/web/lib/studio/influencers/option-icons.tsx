'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Camera,
  CircleDot,
  CircleUser,
  CircleUserRound,
  ClipboardCheck,
  Droplets,
  Dumbbell,
  Eye,
  FileText,
  Fingerprint,
  Flame,
  Gamepad2,
  Gem,
  Glasses,
  Globe,
  GraduationCap,
  Hammer,
  Heart,
  Laugh,
  Lightbulb,
  LineChart,
  MapPin,
  MessageSquare,
  Minus,
  Mountain,
  Newspaper,
  Palette,
  PawPrint,
  PenLine,
  PersonStanding,
  ScanFace,
  Scissors,
  Settings2,
  Shirt,
  Smartphone,
  Sparkles,
  Sprout,
  Sun,
  Target,
  User,
  UserRound,
  UtensilsCrossed,
  Waves,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'

export const NICHE_ICONS: Record<string, LucideIcon> = {
  fitness: Dumbbell,
  fashion: Shirt,
  beauty: Sparkles,
  travel: MapPin,
  tech: Wrench,
  food: UtensilsCrossed,
  gaming: Gamepad2,
  lifestyle: Sprout,
  business: Briefcase,
  comedy: Laugh,
  wellness: Heart,
  finance: LineChart,
  parenting: UserRound,
  pets: PawPrint,
  education: GraduationCap,
  diy: Hammer,
}

export const AESTHETIC_ICONS: Record<string, LucideIcon> = {
  minimalist: Minus,
  streetwear: Shirt,
  glam: Gem,
  outdoorsy: Mountain,
  editorial: Newspaper,
  casual: User,
  sporty: Zap,
  vintage: Camera,
}

export const HAIR_STYLE_ICONS: Record<string, LucideIcon> = {
  'straight long': User,
  'straight short': Scissors,
  wavy: Waves,
  curly: Wind,
  coily: CircleDot,
  bob: UserRound,
  pixie: Sparkles,
  braids: Minus,
  bun: CircleDot,
  'slicked back': ScanFace,
}

export const BODY_SHAPE_ICONS: Record<string, LucideIcon> = {
  slim: User,
  athletic: Dumbbell,
  curvy: Heart,
  'plus-size': UserRound,
  muscular: Flame,
}

export const PHOTO_STYLE_ICONS: Record<string, LucideIcon> = {
  'ugc-phone': Smartphone,
  'creator-camera': Camera,
  'studio-polish': Lightbulb,
}

export const FACIAL_HAIR_ICONS: Record<string, LucideIcon> = {
  none: Minus,
  stubble: ScanFace,
  beard: User,
  mustache: UserRound,
  goatee: CircleDot,
}

export const MAKEUP_ICONS: Record<string, LucideIcon> = {
  natural: Sparkles,
  'no-makeup': Droplets,
  glam: Gem,
  bold: Flame,
}

export const FEATURE_ICONS: Record<string, LucideIcon> = {
  freckles: Sparkles,
  glasses: Glasses,
  tattoos: Palette,
  piercings: Gem,
  dimples: Laugh,
  'beauty mark': CircleDot,
}

export const GENDER_ICONS: Record<string, LucideIcon> = {
  female: CircleUserRound,
  male: CircleUser,
  'non-binary': UserRound,
}

export const HEIGHT_ICONS: Record<string, LucideIcon> = {
  short: ArrowDown,
  average: PersonStanding,
  tall: ArrowUp,
}

export const FIELD_ICONS = {
  name: PenLine,
  gender: User,
  age: Target,
  niche: Target,
  ethnicity: Globe,
  bio: MessageSquare,
  customBackground: FileText,
  hairColor: Palette,
  hairStyle: Scissors,
  eyeColor: Eye,
  skinTone: Sun,
  bodyShape: PersonStanding,
  height: PersonStanding,
  facialHair: ScanFace,
  makeup: Sparkles,
  features: Fingerprint,
  photoStyle: Camera,
  aesthetic: Sparkles,
  directions: FileText,
  advanced: Settings2,
} as const satisfies Record<string, LucideIcon>

export const PREVIEW_SECTION_ICONS = {
  look: Scissors,
  build: PersonStanding,
  niche: Target,
  photo: Camera,
  vibe: Sparkles,
  direction: FileText,
  details: Fingerprint,
} as const satisfies Record<string, LucideIcon>

export const WIZARD_STEP_ICONS: Record<number, LucideIcon> = {
  1: User,
  2: ScanFace,
  3: Palette,
  4: ClipboardCheck,
}

export type OptionIconGroup =
  | 'niche'
  | 'aesthetic'
  | 'hairStyle'
  | 'bodyShape'
  | 'photoStyle'
  | 'facialHair'
  | 'makeup'
  | 'feature'
  | 'gender'
  | 'height'

const ICON_MAPS: Record<OptionIconGroup, Record<string, LucideIcon>> = {
  niche: NICHE_ICONS,
  aesthetic: AESTHETIC_ICONS,
  hairStyle: HAIR_STYLE_ICONS,
  bodyShape: BODY_SHAPE_ICONS,
  photoStyle: PHOTO_STYLE_ICONS,
  facialHair: FACIAL_HAIR_ICONS,
  makeup: MAKEUP_ICONS,
  feature: FEATURE_ICONS,
  gender: GENDER_ICONS,
  height: HEIGHT_ICONS,
}

export function getOptionIcon(group: OptionIconGroup, id: string): LucideIcon | undefined {
  return ICON_MAPS[group][id]
}

export function OptionIcon({
  icon: Icon,
  className,
  selected,
}: {
  icon?: LucideIcon
  className?: string
  selected?: boolean
}) {
  if (!Icon) return null
  return (
    <Icon
      aria-hidden
      className={cn(
        'size-3.5 shrink-0 stroke-[1.75]',
        selected ? 'text-background' : 'text-muted-foreground/80',
        className,
      )}
    />
  )
}

export function FieldIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/40 ring-1 ring-border/30',
        className,
      )}
    >
      <Icon className="size-3 text-muted-foreground" strokeWidth={1.75} />
    </span>
  )
}
