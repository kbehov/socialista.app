export type StudioFontFace = {
  /** CSS font-weight, including variable ranges such as "100 900". */
  weight: string
  woff2: string
  ttf: string
}

export type StudioFontGroup = 'Popular' | 'Sans' | 'Serif' | 'Display' | 'Script'

export type StudioFont = {
  label: string
  family: string
  stack: string
  group: StudioFontGroup
  faces: readonly StudioFontFace[]
}

const FONTSOURCE = 'https://cdn.jsdelivr.net/fontsource/fonts'
const GOOGLE_FONTS = 'https://cdn.jsdelivr.net/gh/google/fonts@main'

function stack(family: string, fallback: string): string {
  const quoted = /\s/.test(family) ? `"${family}"` : family
  return `${quoted}, ${fallback}`
}

function woff2(id: string, file: string, variable = false, version = '5.2.8'): string {
  const pkg = variable ? `${id}:vf@${version}` : `${id}@${version}`
  return `${FONTSOURCE}/${pkg}/${file}`
}

function ttf(filePath: string): string {
  return `${GOOGLE_FONTS}/${filePath.split('/').map(segment => encodeURIComponent(segment)).join('/')}`
}

function variableFont(
  label: string,
  group: StudioFontGroup,
  fallback: string,
  fontsourceId: string,
  ttfPath: string,
  version = '5.2.8',
): StudioFont {
  return {
    label,
    family: label,
    stack: stack(label, fallback),
    group,
    faces: [
      {
        weight: '100 900',
        woff2: woff2(fontsourceId, 'latin-wght-normal.woff2', true, version),
        ttf: ttf(ttfPath),
      },
    ],
  }
}

function staticFont(
  label: string,
  group: StudioFontGroup,
  fallback: string,
  fontsourceId: string,
  regularTtf: string,
  boldTtf?: string,
  version = '5.2.8',
): StudioFont {
  const regularWoff = woff2(fontsourceId, 'latin-400-normal.woff2', false, version)
  const boldWoff = boldTtf ? woff2(fontsourceId, 'latin-700-normal.woff2', false, version) : regularWoff
  return {
    label,
    family: label,
    stack: stack(label, fallback),
    group,
    faces: [
      { weight: '400', woff2: regularWoff, ttf: ttf(regularTtf) },
      { weight: '700', woff2: boldWoff, ttf: ttf(boldTtf ?? regularTtf) },
    ],
  }
}

/** Web fonts for the carousel and video text pickers. Stacks are the persisted font-family value. */
export const STUDIO_FONTS = [
  variableFont('Montserrat', 'Popular', 'sans-serif', 'montserrat', 'ofl/montserrat/Montserrat[wght].ttf'),
  staticFont('Poppins', 'Popular', 'sans-serif', 'poppins', 'ofl/poppins/Poppins-Regular.ttf', 'ofl/poppins/Poppins-Bold.ttf', '5.2.7'),
  variableFont('Playfair Display', 'Popular', 'Georgia, serif', 'playfair-display', 'ofl/playfairdisplay/PlayfairDisplay[wght].ttf'),
  staticFont('Bebas Neue', 'Popular', 'Impact, sans-serif', 'bebas-neue', 'ofl/bebasneue/BebasNeue-Regular.ttf', undefined, '5.2.7'),

  variableFont('DM Sans', 'Sans', 'sans-serif', 'dm-sans', 'ofl/dmsans/DMSans[opsz,wght].ttf'),
  variableFont('Outfit', 'Sans', 'sans-serif', 'outfit', 'ofl/outfit/Outfit[wght].ttf'),
  variableFont('Manrope', 'Sans', 'sans-serif', 'manrope', 'ofl/manrope/Manrope[wght].ttf'),
  variableFont('Instrument Sans', 'Sans', 'sans-serif', 'instrument-sans', 'ofl/instrumentsans/InstrumentSans[wdth,wght].ttf'),
  variableFont('Space Grotesk', 'Sans', 'sans-serif', 'space-grotesk', 'ofl/spacegrotesk/SpaceGrotesk[wght].ttf'),
  variableFont('Oswald', 'Sans', 'sans-serif', 'oswald', 'ofl/oswald/Oswald[wght].ttf'),
  variableFont('Raleway', 'Sans', 'sans-serif', 'raleway', 'ofl/raleway/Raleway[wght].ttf'),

  staticFont('Instrument Serif', 'Serif', 'Georgia, serif', 'instrument-serif', 'ofl/instrumentserif/InstrumentSerif-Regular.ttf'),
  variableFont('Fraunces', 'Serif', 'Georgia, serif', 'fraunces', 'ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf'),
  variableFont('Cormorant Garamond', 'Serif', 'Georgia, serif', 'cormorant-garamond', 'ofl/cormorantgaramond/CormorantGaramond[wght].ttf', '5.2.6'),
  variableFont('Bodoni Moda', 'Serif', 'Georgia, serif', 'bodoni-moda', 'ofl/bodonimoda/BodoniModa[opsz,wght].ttf', '5.2.6'),
  variableFont('Newsreader', 'Serif', 'Georgia, serif', 'newsreader', 'ofl/newsreader/Newsreader[opsz,wght].ttf'),
  variableFont('Lora', 'Serif', 'Georgia, serif', 'lora', 'ofl/lora/Lora[wght].ttf'),
  staticFont(
    'Libre Baskerville',
    'Serif',
    'Georgia, serif',
    'libre-baskerville',
    'ofl/librebaskerville/LibreBaskerville[wght].ttf',
    'ofl/librebaskerville/LibreBaskerville[wght].ttf',
  ),

  staticFont('Anton', 'Display', 'Impact, sans-serif', 'anton', 'ofl/anton/Anton-Regular.ttf', undefined, '5.2.7'),
  staticFont('Abril Fatface', 'Display', 'Georgia, serif', 'abril-fatface', 'ofl/abrilfatface/AbrilFatface-Regular.ttf', undefined, '5.2.7'),
  variableFont('Cinzel', 'Display', 'Georgia, serif', 'cinzel', 'ofl/cinzel/Cinzel[wght].ttf'),
  variableFont('Syne', 'Display', 'sans-serif', 'syne', 'ofl/syne/Syne[wght].ttf', '5.2.6'),

  staticFont('Great Vibes', 'Script', 'cursive', 'great-vibes', 'ofl/greatvibes/GreatVibes-Regular.ttf'),
  variableFont('Caveat', 'Script', 'cursive', 'caveat', 'ofl/caveat/Caveat[wght].ttf'),
  staticFont('Pacifico', 'Script', 'cursive', 'pacifico', 'ofl/pacifico/Pacifico-Regular.ttf', undefined, '5.2.7'),
] as const satisfies readonly StudioFont[]

const STUDIO_FONTS_BY_FAMILY = new Map<string, StudioFont>(STUDIO_FONTS.map(font => [font.family, font]))

export function studioFontFamilyName(fontFamily: string): string {
  return fontFamily.split(',')[0]?.replace(/["']/g, '').trim() ?? ''
}

export function studioFontFromCss(fontFamily: string): StudioFont | undefined {
  return STUDIO_FONTS_BY_FAMILY.get(studioFontFamilyName(fontFamily))
}

/** Weights librsvg can match. Variable ranges are pinned to the editor's normal and bold toggles. */
export function studioFontFaceWeights(weight: string): string[] {
  return weight.includes(' ') ? ['400', '700'] : [weight]
}
