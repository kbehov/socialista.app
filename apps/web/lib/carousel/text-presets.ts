import type { TextLayerStyle, TextShadow } from '@socialista/types'
import { FONT_FAMILIES } from './defaults'

export type TextPreset = {
  id: string
  label: string
  style: Partial<TextLayerStyle>
}

const IMPACT = FONT_FAMILIES[5]

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
    id: 'label',
    label: 'Label',
    style: {
      fontFamily: FONT_FAMILIES[0],
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
      fontFamily: FONT_FAMILIES[0],
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
      fontFamily: FONT_FAMILIES[0],
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
  }
}
