import type { UgcWorkbenchTab } from '@/types/ugc.types'
import {
  UGC_SCENE_CATALOG,
  UGC_SCENE_GROUP_LABELS,
  UGC_SCENE_TYPES_BY_GROUP,
  ugcClipGeneratesAudio,
  ugcClipUsesLipSync,
  ugcClipUsesTalkingHeadModel,
  type UgcClipType,
  type UgcSceneDefinition,
  type UgcSceneGroup,
} from '@socialista/types'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRightIcon,
  BoxIcon,
  HandIcon,
  MegaphoneIcon,
  MicIcon,
  PackageIcon,
  PenLineIcon,
  PlayCircleIcon,
  ShirtIcon,
  SmartphoneIcon,
  SmileIcon,
  SparklesIcon,
  StarIcon,
  ZapIcon,
} from 'lucide-react'

export const UGC_SCENE_ICONS: Record<UgcClipType, LucideIcon> = {
  hook: ZapIcon,
  talking: MicIcon,
  'product-hold': HandIcon,
  'b-roll': PackageIcon,
  unboxing: BoxIcon,
  cta: MegaphoneIcon,
  demo: PlayCircleIcon,
  'try-on': ShirtIcon,
  review: StarIcon,
  reaction: SmileIcon,
  'before-after': ArrowLeftRightIcon,
  'app-showcase': SmartphoneIcon,
  custom: PenLineIcon,
}

export function ugcSceneIcon(type: UgcClipType): LucideIcon {
  return UGC_SCENE_ICONS[type] ?? SparklesIcon
}

export function ugcSceneMeta(type: UgcClipType): UgcSceneDefinition {
  return UGC_SCENE_CATALOG[type]
}

export const UGC_SCENE_MENU_GROUPS: Array<{
  group: UgcSceneGroup
  label: string
  types: UgcClipType[]
}> = UGC_SCENE_TYPES_BY_GROUP.map(entry => ({
  group: entry.group,
  label: UGC_SCENE_GROUP_LABELS[entry.group],
  types: entry.types,
}))

const ALL_TABS: UgcWorkbenchTab[] = ['image', 'audio', 'video']

export type UgcSceneWorkbenchConfig = {
  tabs: UgcWorkbenchTab[]
  audioRequiredForVideo: boolean
  talkingHead: boolean
  voiceoverOnly: boolean
}

export function ugcSceneWorkbenchConfig(type: UgcClipType): UgcSceneWorkbenchConfig {
  const talkingHead = ugcClipUsesTalkingHeadModel(type)
  return {
    tabs: ugcClipGeneratesAudio(type) ? ALL_TABS : ['image', 'video'],
    audioRequiredForVideo: talkingHead,
    talkingHead,
    voiceoverOnly: !ugcClipUsesLipSync(type),
  }
}
