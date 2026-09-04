'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowDown,
  ArrowUp,
  Baby,
  Briefcase,
  BookOpen,
  Building2,
  Camera,
  Car,
  CircleDot,
  CircleUser,
  CircleUserRound,
  Coffee,
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
  Headphones,
  Heart,
  Home,
  Images,
  Laptop,
  Laugh,
  Lightbulb,
  LineChart,
  MapPin,
  MessageSquare,
  Mic,
  Minus,
  Monitor,
  Mountain,
  Newspaper,
  Palette,
  Package,
  PawPrint,
  PenLine,
  PersonStanding,
  Plane,
  Pointer,
  ScanFace,
  Scissors,
  Settings2,
  Shirt,
  ShoppingBag,
  Smartphone,
  Snowflake,
  Sparkles,
  Sprout,
  Store,
  Sun,
  Target,
  User,
  UserRound,
  UtensilsCrossed,
  Watch,
  Waves,
  Wind,
  Wine,
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

export const VIBE_ICONS: Record<string, LucideIcon> = {
  energetic: Zap,
  calm: Heart,
  confident: Target,
  playful: Laugh,
  warm: Sun,
  authoritative: Briefcase,
  quirky: Sparkles,
  aspirational: Sparkles,
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

export const SHOT_PACK_ICONS: Record<string, LucideIcon> = {
  quick: Zap,
  'ugc-kit': Images,
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

export const SCENE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  'kitchen-cooking': UtensilsCrossed,
  'bedroom-morning': Sun,
  'bathroom-vanity': Droplets,
  'coffee-shop': Coffee,
  restaurant: Wine,
  'podcast-setup': Mic,
  gym: Dumbbell,
  yoga: Heart,
  'outdoor-run': Mountain,
  airport: Plane,
  plane: Plane,
  car: Car,
  'hotel-room': Home,
  beach: Waves,
  street: MapPin,
  snow: Snowflake,
  'winter-city': Snowflake,
  store: Store,
  'farmers-market': Sprout,
  'streaming-desk': Monitor,
  'asmr-desk': Mic,
  'mirror-ootd': Smartphone,
  'product-hook': Target,
  'pointing-reveal': Pointer,
  'sitting-testimonial': MessageSquare,
  'pregnant-bump': Baby,
  library: BookOpen,
  classroom: GraduationCap,
  'study-desk': BookOpen,
  'home-office': Building2,
  'grocery-store': Store,
  park: Mountain,
  balcony: Sun,
  'unboxing-desk': Package,
  grwm: Sparkles,
  playground: Baby,
}

export const ACCESSORY_ICONS: Record<string, LucideIcon> = {
  headphones: Headphones,
  glasses: Glasses,
  sunglasses: Sun,
  hat: CircleDot,
  beanie: CircleDot,
  bag: ShoppingBag,
  jewelry: Gem,
  watch: Watch,
  scarf: Wind,
  candle: Flame,
  mic: Mic,
  phone: Smartphone,
  laptop: Laptop,
  dumbbell: Dumbbell,
  'coffee-cup': Coffee,
  'water-bottle': Droplets,
  'skincare-bottle': Sparkles,
  pet: PawPrint,
  'shopping-bag': ShoppingBag,
  books: BookOpen,
  notebook: PenLine,
  backpack: ShoppingBag,
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
  styleReference: Images,
  photoStyle: Camera,
  shotPack: Images,
  aesthetic: Sparkles,
  vibe: Sparkles,
  scenes: MapPin,
  accessories: ShoppingBag,
  directions: FileText,
  model: Zap,
  advanced: Settings2,
} as const satisfies Record<string, LucideIcon>

export type OptionIconGroup =
  | 'niche'
  | 'aesthetic'
  | 'vibe'
  | 'hairStyle'
  | 'bodyShape'
  | 'photoStyle'
  | 'shotPack'
  | 'facialHair'
  | 'makeup'
  | 'feature'
  | 'gender'
  | 'height'
  | 'scene'
  | 'accessory'

const ICON_MAPS: Record<OptionIconGroup, Record<string, LucideIcon>> = {
  niche: NICHE_ICONS,
  aesthetic: AESTHETIC_ICONS,
  vibe: VIBE_ICONS,
  hairStyle: HAIR_STYLE_ICONS,
  bodyShape: BODY_SHAPE_ICONS,
  photoStyle: PHOTO_STYLE_ICONS,
  shotPack: SHOT_PACK_ICONS,
  facialHair: FACIAL_HAIR_ICONS,
  makeup: MAKEUP_ICONS,
  feature: FEATURE_ICONS,
  gender: GENDER_ICONS,
  height: HEIGHT_ICONS,
  scene: SCENE_ICONS,
  accessory: ACCESSORY_ICONS,
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
