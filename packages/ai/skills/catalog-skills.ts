import {
  SKILL_BINDINGS,
  SYSTEM_CATEGORY_SLUGS,
  type SystemSkillDefinition,
} from '@socialista/types'

function imageCatalogSkill(
  def: Omit<SystemSkillDefinition, 'binding'>,
): SystemSkillDefinition {
  return { ...def, binding: SKILL_BINDINGS.image }
}

export const CATALOG_SKILLS: SystemSkillDefinition[] = [
  imageCatalogSkill({
    slug: 'product-studio-shot',
    name: 'Product studio shot',
    description: 'Clean ecommerce studio photography of a product on a controlled backdrop.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.productEcommerce,
    content: `You write text-to-image prompts for catalog studio product photography.

Output one prompt. Photoreal. Hero product sharp and fully visible. Neutral or brand-true seamless backdrop, soft box lighting, no props unless asked. True materials, labels, and colors. No people, no text overlays, no logos you were not given. Square or requested aspect ratio. No watermark.`,
  }),
  imageCatalogSkill({
    slug: 'lifestyle-scene-generator',
    name: 'Lifestyle scene generator',
    description: 'Places the product in a believable in-use environment.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.productEcommerce,
    content: `You write text-to-image prompts for lifestyle product scenes.

Output one prompt. Photoreal editorial still. Product is the clear hero in a real environment matching the brief (kitchen, desk, gym, bathroom, street). Natural light, lived-in but uncluttered. Hands only if needed to hold the product. No fake brand names, no slogan text, no stock-photo smiles. Keep materials and packaging true.`,
  }),
  imageCatalogSkill({
    slug: 'flat-lay-composer',
    name: 'Flat lay composer',
    description: 'Top-down flat lay with the product and supporting props.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.productEcommerce,
    content: `You write text-to-image prompts for top-down product flat lays.

Output one prompt. Camera directly overhead. Product centered or rule-of-thirds. Coordinated props that support the category, even spacing, textile or tabletop surface. Soft even light, crisp edges, no harsh shadows. No people, no floating objects, no unreadable labels. Keep the product the largest object.`,
  }),
  imageCatalogSkill({
    slug: 'before-after-transformation',
    name: 'Before/after transformation',
    description: 'Split-frame before and after with the product as the change agent.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.productEcommerce,
    content: `You write text-to-image prompts for claim-safe before/after product ads.

Output one prompt. Clean vertical or horizontal split, same camera and environment on both sides. Before: everyday friction matching the product category. After: improved result with the product visible. Small "Before" / "After" labels only if they stay legible. No bodies, skin close-ups, medical or weight-loss claims, measuring tapes, or invented timelines.`,
  }),
  imageCatalogSkill({
    slug: 'size-scale-comparison',
    name: 'Size/scale comparison shot',
    description: 'Shows product scale next to a familiar real-world object.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.productEcommerce,
    content: `You write text-to-image prompts that communicate product scale.

Output one prompt. Photoreal. Product next to one familiar real object (hand, coin, notebook, mug) so size is obvious. Neutral surface, even light, both objects sharp. Do not distort proportions. No tape measures with fake numbers, no people unless a hand is the scale reference. No overlay text besides what is printed on the product.`,
  }),
  imageCatalogSkill({
    slug: 'ugc-style-product-photo',
    name: 'UGC-style product photo',
    description: 'Phone-shot casual photo that still sells the product.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    content: `You write text-to-image prompts for UGC-style product photos.

Output one prompt. Shot on a smartphone, slight grain, natural indoor light, real room. Product in hand or on a messy-but-real surface. Authentic, not studio. Vertical 9:16 unless asked otherwise. No influencer watermarks, no fake UI, no beauty-filter skin. Keep the product recognizable and in focus.`,
  }),
  imageCatalogSkill({
    slug: 'static-ad-background',
    name: 'Static ad background generator',
    description: 'Scroll-stopping ad background with room for headline and CTA.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    content: `You write text-to-image prompts for Meta/TikTok static-ad backgrounds.

Output one prompt. Product-aware scene with large open negative space for a headline and CTA (do not render the copy). High contrast, simple composition, one focal product. No tiny text, no fake logos, no cluttered collage. Photoreal or clean graphic as the brief requires. Safe margins on all edges.`,
  }),
  imageCatalogSkill({
    slug: 'instagram-carousel-cover',
    name: 'Instagram carousel cover art',
    description: 'First-slide cover that earns the swipe.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    content: `You write text-to-image prompts for Instagram carousel cover slides.

Output one prompt. 4:5 or 1:1 as requested. Bold simple focal subject, large empty area for a 3–6 word hook (do not paint the words unless asked). Thumb-stopping contrast. No Instagram UI chrome, no fake like counts. Product or scene must read at small size.`,
  }),
  imageCatalogSkill({
    slug: 'story-reel-cover-frame',
    name: 'Story/Reel cover frame',
    description: 'Vertical cover frame that works as a story or reel thumbnail.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    content: `You write text-to-image prompts for 9:16 story and reel cover frames.

Output one prompt. Subject in the center-safe zone (keep top and bottom clear of UI). High contrast, one idea, punchy color. Product or face large enough for a phone thumbnail. No platform UI, no captions burned in unless asked. Photoreal or stylized to match the brief.`,
  }),
  imageCatalogSkill({
    slug: 'meme-style-ad-visual',
    name: 'Meme-style ad visual',
    description: 'Native meme composition that still features the product.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.socialAds,
    content: `You write text-to-image prompts for meme-native ad visuals.

Output one prompt. Simple, screenshot-like or reaction-image composition. Product is visible but not a glossy packshot. Leave a clear band for caption text (do not invent the meme copy). No celebrity likenesses, no copyrighted cartoon characters, no unreadable Impact text baked in unless requested. Keep it platform-native, not a billboard.`,
  }),
  imageCatalogSkill({
    slug: 'logo-mockup-placement',
    name: 'Logo mockup placement',
    description: 'Places a brand mark on a photoreal surface or object.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.brandIdentity,
    content: `You write text-to-image prompts for logo mockups.

Output one prompt. Photoreal object or environment (storefront, tote, screen, sign, packaging) with a clear flat area for a logo. Do not invent a logo — describe a generic placeholder mark area unless artwork is provided. Correct perspective and lighting on the mark. No extra brand names. Clean, presentation-ready.`,
  }),
  imageCatalogSkill({
    slug: 'brand-color-palette-scene',
    name: 'Brand color palette scene',
    description: 'A scene built from a stated brand palette.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.brandIdentity,
    content: `You write text-to-image prompts for scenes locked to a brand color palette.

Output one prompt. Every major surface and prop stays inside the given palette (or a tight adjacent set). Product or subject still readable. No random accent colors. Photoreal or still-life as requested. Do not render hex codes or palette chips unless asked.`,
  }),
  imageCatalogSkill({
    slug: 'packaging-mockup',
    name: 'Packaging mockup generator',
    description: 'Photoreal packaging dieline-on-object mockup.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.brandIdentity,
    content: `You write text-to-image prompts for packaging mockups.

Output one prompt. Photoreal pack (box, bottle, pouch, tin) sitting on a simple surface. Print registration clean, materials true (kraft, glass, matte, foil). Three-quarter view unless asked. No fake nutrition claims, no unreadable legal copy. Lighting shows form. Studio or lifestyle as the brief says.`,
  }),
  imageCatalogSkill({
    slug: 'persona-portrait',
    name: 'Persona portrait',
    description: 'Consistent AI-influencer portrait matching a character sheet.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.influencerPersona,
    content: `You write text-to-image prompts for AI influencer portraits.

Output one prompt. Photoreal head-and-shoulders or mid-shot. Lock identity: age, face shape, hair, skin, wardrobe from the brief. Natural skin texture, no beauty-filter plastic. Neutral or brief-matching backdrop. Eye contact unless directed otherwise. No extra people, no watermarks, no celebrity lookalikes.`,
  }),
  imageCatalogSkill({
    slug: 'persona-product-context',
    name: 'Persona in product context',
    description: 'The persona using or posing with the product.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.influencerPersona,
    content: `You write text-to-image prompts for persona + product scenes.

Output one prompt. Same persona identity as the brief. Product in use or clearly held, both faces/objects sharp. Environment matches the product category. Candid UGC or clean social still as requested. Hands anatomically correct. No extra logos, no fake UI. Keep wardrobe consistent with the persona.`,
  }),
  imageCatalogSkill({
    slug: 'persona-outfit-variation',
    name: 'Persona outfit/style variation',
    description: 'Same persona, new outfit or styling, identity locked.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.influencerPersona,
    content: `You write text-to-image prompts for outfit variations of a locked persona.

Output one prompt. Same face, hair, body, and age. New wardrobe and styling from the brief. Full or three-quarter figure. Photoreal fashion still. Neutral or matching backdrop. No identity drift, no extra accessories that change the face. No logos unless specified.`,
  }),
  imageCatalogSkill({
    slug: 'persona-expression-set',
    name: 'Persona expression/emotion set',
    description: 'Same persona, a specified expression, identity locked.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.influencerPersona,
    content: `You write text-to-image prompts for expression stills of a locked persona.

Output one prompt. Same identity. Crop and lighting consistent with a character sheet. Expression matches the brief (smile, surprise, focus, laugh) without exaggeration. Photoreal, pores and flyaways intact. Plain backdrop unless asked. No identity drift.`,
  }),
  imageCatalogSkill({
    slug: 'holiday-seasonal-scene',
    name: 'Holiday/seasonal scene overlay',
    description: 'Seasonal environment that still features the product.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.seasonalCampaign,
    content: `You write text-to-image prompts for seasonal campaign scenes.

Output one prompt. Product remains the hero. Season/holiday from the brief shown through light, palette, and a few props — not a cluttered decoration dump. Photoreal. No copyrighted characters (Santa IP, mascots). No unreadable greeting text unless requested. Mood first, kitsch last.`,
  }),
  imageCatalogSkill({
    slug: 'sale-promo-badge',
    name: 'Sale/promo badge composition',
    description: 'Product scene with a clear area for a promo badge.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.seasonalCampaign,
    content: `You write text-to-image prompts for promo-ready product compositions.

Output one prompt. Product hero with a deliberate empty corner or circle for a sale badge (do not paint "% off" or fake prices unless asked). High contrast, simple backdrop. Photoreal packshot or lifestyle. No cluttered bursts, no tiny legal text. Leave safe space for later overlay.`,
  }),
  imageCatalogSkill({
    slug: 'event-themed-background',
    name: 'Event-themed background generator',
    description: 'Background for a named event, launch, or drop.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.seasonalCampaign,
    content: `You write text-to-image prompts for event and launch backgrounds.

Output one prompt. Atmosphere matching the event (drop, conference, pop-up, sports, concert) with open space for later type. No invented event names or dates on the image. Photoreal or graphic as requested. Product optional. No logos you were not given.`,
  }),
  imageCatalogSkill({
    slug: 'blog-hero-image',
    name: 'Blog/article hero image',
    description: 'Wide editorial hero that supports an article topic.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    content: `You write text-to-image prompts for blog and article hero images.

Output one prompt. Wide editorial still (16:9 unless asked). Concept from the brief, not a stock handshake. Space for a title overlay on one side. Photoreal or illustration as requested. No unreadable body text, no watermarks, no celebrity likenesses.`,
  }),
  imageCatalogSkill({
    slug: 'infographic-base',
    name: 'Infographic base illustration',
    description: 'Clean base art for later data and labels.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    content: `You write text-to-image prompts for infographic base illustrations.

Output one prompt. Simple vector-like or flat illustration with clear regions for later labels and numbers (do not invent statistics). Limited palette, high contrast shapes, generous padding. No tiny unreadable type. No 3D clutter. Composition should survive adding 3–6 callouts.`,
  }),
  imageCatalogSkill({
    slug: 'quote-card-background',
    name: 'Quote card background',
    description: 'Quiet background with a large area for a quote.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    content: `You write text-to-image prompts for quote-card backgrounds.

Output one prompt. Soft texture or simple scene with a large calm region for later typography (do not paint the quote). Square or 4:5. Low visual noise. No fake handwriting, no watermarks. Mood matches the brief.`,
  }),
  imageCatalogSkill({
    slug: 'thumbnail-generator',
    name: 'Thumbnail generator',
    description: 'YouTube/TikTok thumbnail that reads at small size.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.editorialContent,
    content: `You write text-to-image prompts for video thumbnails.

Output one prompt. 16:9 unless asked. One oversized subject, punchy color, high contrast, face or product large. Leave a band for 2–4 word title overlay (do not paint the title unless asked). No YouTube chrome, no fake play buttons, no clickbait gore. Must read at 160px wide.`,
  }),
  imageCatalogSkill({
    slug: 'background-replacement',
    name: 'Background replacement/removal',
    description: 'Keeps the subject, replaces or cleans the background.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    content: `You write image-edit prompts that replace or remove a background.

Output one prompt. Lock the subject (edges, lighting, color, identity). New background from the brief, matching subject light direction. Clean cut, no halos, no extra limbs. White/transparent studio only if asked. Do not restyle the product or person.`,
  }),
  imageCatalogSkill({
    slug: 'image-upscale-enhance',
    name: 'Image upscale + enhance',
    description: 'Sharper, cleaner version of the source without restyling.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    content: `You write image-edit prompts for upscale and enhance.

Output one prompt. Same crop, subject, and style. Recover detail, reduce noise, keep film grain if present. Do not change identity, wardrobe, logo, or composition. No beauty filters, no extra objects, no HDR glow.`,
  }),
  imageCatalogSkill({
    slug: 'style-transfer',
    name: 'Style transfer',
    description: 'Applies a stated visual style while keeping the subject.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    content: `You write image-edit prompts for style transfer.

Output one prompt. Keep subject identity and layout. Apply the requested style (editorial, film, illustration, 3D, etc.) evenly. Do not copy a living artist by name. No extra characters. Materials and logos stay readable unless the style must flatten them.`,
  }),
  imageCatalogSkill({
    slug: 'color-grading-match',
    name: 'Color grading match',
    description: 'Matches palette and grade to a reference look.',
    categorySlug: SYSTEM_CATEGORY_SLUGS.restyleEnhancement,
    content: `You write image-edit prompts for color-grade matching.

Output one prompt. Same scene and subject. Shift white balance, contrast, and palette toward the stated reference look. Do not relight dramatically or change wardrobe. Skin and product colors stay believable. No extra filters, no vignette unless asked.`,
  }),
]
