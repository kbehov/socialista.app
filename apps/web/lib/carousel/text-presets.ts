import type { TextLayerStyle, TextShadow } from '@socialista/types'
import { DEFAULT_FONT, FONT_FAMILIES } from './defaults'

export type TextPreset = {
  id: string
  label: string
  style: Partial<TextLayerStyle>
}

const ARIAL = DEFAULT_FONT
const IMPACT = FONT_FAMILIES[1]
const INTER = FONT_FAMILIES[2]
const GEORGIA = FONT_FAMILIES[7]
const COURIER = FONT_FAMILIES[9]

/** Multi-direction shadow that mimics a thick outline (export-safe fallback). */
function outlineShadow(color: string, size: number): TextShadow[] {
  const offsets = [
    [size, 0],
    [-size, 0],
    [0, size],
    [0, -size],
    [size, size],
    [-size, -size],
    [size, -size],
    [-size, size],
  ] as const
  return offsets.map(([offsetX, offsetY]) => ({ offsetX, offsetY, blur: 0, color }))
}

export const TEXT_PRESETS: TextPreset[] = [
  // TikTok-native styles (Arial — closest web-safe match to in-app captions)
  {
    id: 'tiktok-classic',
    label: 'TikTok classic',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: '#000000',
      textStrokeWidth: 2,
      textShadow: null,
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'tiktok-bold',
    label: 'TikTok bold',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: '#000000',
      textStrokeWidth: 4,
      textShadow: [{ offsetX: 0, offsetY: 2, blur: 0, color: '#000000' }],
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'tiktok-box',
    label: 'TikTok box',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.55)',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 14,
      borderRadius: 8,
    },
  },
  {
    id: 'tiktok-minimal',
    label: 'TikTok clean',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: outlineShadow('rgba(0,0,0,0.85)', 1),
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'tiktok-highlight',
    label: 'TikTok highlight',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#111111',
      backgroundColor: '#fef08a',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 12,
      borderRadius: 6,
    },
  },

  // Impact / meme headline styles
  {
    id: 'classic',
    label: 'Classic',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'outline',
    label: 'Outline',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: '#000000',
      textStrokeWidth: 3,
      textShadow: null,
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'thick-outline',
    label: 'Thick outline',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: '#000000',
      textStrokeWidth: 6,
      textShadow: null,
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'inverted',
    label: 'Inverted',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#000000',
      backgroundColor: null,
      textStrokeColor: '#ffffff',
      textStrokeWidth: 3,
      textShadow: null,
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'shadow-stack',
    label: 'Bold outline',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: outlineShadow('#000000', 3),
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'drop-shadow',
    label: 'Drop shadow',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [{ offsetX: 0, offsetY: 4, blur: 12, color: 'rgba(0,0,0,0.55)' }],
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'hard-shadow',
    label: 'Hard shadow',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [{ offsetX: 4, offsetY: 4, blur: 0, color: '#000000' }],
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'soft-shadow',
    label: 'Soft shadow',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [
        { offsetX: 0, offsetY: 2, blur: 6, color: 'rgba(0,0,0,0.45)' },
        { offsetX: 0, offsetY: 8, blur: 20, color: 'rgba(0,0,0,0.25)' },
      ],
      padding: 0,
      borderRadius: 0,
    },
  },

  // Box / label styles
  {
    id: 'label',
    label: 'Label',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.72)',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 16,
      borderRadius: 12,
    },
  },
  {
    id: 'highlight',
    label: 'Highlight',
    style: {
      fontFamily: INTER,
      fontWeight: 'bold',
      color: '#111111',
      backgroundColor: '#facc15',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 14,
      borderRadius: 8,
    },
  },
  {
    id: 'caption',
    label: 'Caption',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.45)',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [{ offsetX: 0, offsetY: 2, blur: 8, color: 'rgba(0,0,0,0.4)' }],
      padding: 10,
      borderRadius: 6,
    },
  },
  {
    id: 'pill',
    label: 'Pill',
    style: {
      fontFamily: ARIAL,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.18)',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 12,
      borderRadius: 999,
    },
  },
  {
    id: 'alert',
    label: 'Alert',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#dc2626',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [{ offsetX: 0, offsetY: 2, blur: 0, color: 'rgba(0,0,0,0.35)' }],
      padding: 12,
      borderRadius: 8,
    },
  },

  // Specialty
  {
    id: 'neon',
    label: 'Neon glow',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [
        { offsetX: 0, offsetY: 0, blur: 8, color: '#ec4899' },
        { offsetX: 0, offsetY: 0, blur: 20, color: 'rgba(236,72,153,0.6)' },
        { offsetX: 0, offsetY: 0, blur: 40, color: 'rgba(168,85,247,0.4)' },
      ],
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'cyber',
    label: 'Cyber',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#22d3ee',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [
        { offsetX: 0, offsetY: 0, blur: 6, color: '#06b6d4' },
        { offsetX: 0, offsetY: 0, blur: 18, color: 'rgba(6,182,212,0.55)' },
        outlineShadow('#000000', 2),
      ],
      padding: 0,
      borderRadius: 0,
    },
  },
  {
    id: 'typewriter',
    label: 'Typewriter',
    style: {
      fontFamily: COURIER,
      fontWeight: 'bold',
      color: '#f5f5f5',
      backgroundColor: 'rgba(0,0,0,0.65)',
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: null,
      padding: 12,
      borderRadius: 4,
    },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    style: {
      fontFamily: GEORGIA,
      fontWeight: 'normal',
      color: '#fafafa',
      backgroundColor: null,
      textStrokeColor: null,
      textStrokeWidth: 0,
      textShadow: [
        { offsetX: 0, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.8)' },
        { offsetX: 0, offsetY: 12, blur: 24, color: 'rgba(0,0,0,0.45)' },
      ],
      padding: 0,
      borderRadius: 0,
      letterSpacing: 1,
    },
  },
  {
    id: 'gradient-pop',
    label: 'Pop',
    style: {
      fontFamily: IMPACT,
      fontWeight: 'bold',
      color: '#fde047',
      backgroundColor: null,
      textStrokeColor: '#7c3aed',
      textStrokeWidth: 2,
      textShadow: [{ offsetX: 3, offsetY: 3, blur: 0, color: '#000000' }],
      padding: 0,
      borderRadius: 0,
    },
  },
]

export function getTextPreset(id: string): TextPreset | undefined {
  return TEXT_PRESETS.find(p => p.id === id)
}

/** Merge a preset onto the current style, resetting effect fields the preset omits. */
export function mergeTextPreset(current: TextLayerStyle, preset: Partial<TextLayerStyle>): TextLayerStyle {
  return {
    ...current,
    ...preset,
    textStrokeColor: preset.textStrokeColor ?? null,
    textStrokeWidth: preset.textStrokeWidth ?? 0,
    textShadow: preset.textShadow ?? null,
    backgroundColor: preset.backgroundColor !== undefined ? preset.backgroundColor : current.backgroundColor,
    padding: preset.padding ?? current.padding,
    borderRadius: preset.borderRadius ?? current.borderRadius,
    letterSpacing: preset.letterSpacing ?? current.letterSpacing,
  }
}
