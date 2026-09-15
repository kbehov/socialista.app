import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { OUTPUT_GALLERY } from './content'
import { FadeIn } from './fade-in'

const media = { ugc: '/landing/product-ugc.webp', ad: '/landing/product-ad.webp', carousel: '/landing/product-carousel.webp' } as const

export function LandingOutputGallery() {
  return <section id="creative" aria-labelledby="creative-heading" className="bg-[var(--landing-charcoal)] py-20 text-white sm:py-24 lg:py-28"><div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8"><FadeIn><div className="max-w-2xl"><p className="text-sm font-semibold text-[var(--landing-orange)]">The creative studio</p><h2 id="creative-heading" className="mt-4 text-balance text-[clamp(2.25rem,4vw,4rem)] font-semibold leading-[.98] tracking-[-0.06em]">{OUTPUT_GALLERY.title}</h2><p className="mt-5 text-[1.0625rem] leading-7 text-white/65">{OUTPUT_GALLERY.description}</p></div></FadeIn><div className="mt-12 grid gap-4 md:grid-cols-3"><FadeIn className="md:col-span-2"><article className="group relative min-h-[28rem] overflow-hidden rounded-2xl bg-[#c98f76] sm:min-h-[38rem]"><Image src={media.ugc} alt="Creator-style UGC video for social" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-6 pt-28 sm:p-8"><p className="text-sm text-white/65">01 · {OUTPUT_GALLERY.items[0].title}</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{OUTPUT_GALLERY.items[0].description}</h3></div></article></FadeIn><div className="grid gap-4"><FadeIn delay={.06}><GalleryCard item={OUTPUT_GALLERY.items[1]} image={media.ad} /></FadeIn><FadeIn delay={.1}><GalleryCard item={OUTPUT_GALLERY.items[2]} image={media.carousel} /></FadeIn></div></div></div></section>
}

function GalleryCard({ item, image }: { item: (typeof OUTPUT_GALLERY.items)[number]; image: string }) {
  return <article className="group relative min-h-[18rem] overflow-hidden rounded-2xl bg-white/8"><Image src={image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><ArrowUpRight className="mb-8 size-5 text-[var(--landing-orange)]" aria-hidden="true" /><p className="text-sm text-white/65">{item.title}</p><h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">{item.description}</h3></div></article>
}
