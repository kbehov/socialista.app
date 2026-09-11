import { BENTO } from './content'
import { FadeIn } from './fade-in'
import { landingEyebrow, landingMediaCard } from './landing-classes'
import { IMG, VIDEO } from './media'
import { MediaFrame } from './media-frame'
import { MockupAnalytics } from './mockups/mockup-analytics'
import { MockupComposer } from './mockups/mockup-composer'
import { Section } from './section'
import { SectionHeader } from './section-header'

function CreateVisual() {
  return (
    <div
      className="grid grid-cols-4 grid-rows-[repeat(2,5.5rem)] gap-[0.55rem] sm:grid-rows-[repeat(2,6.5rem)] sm:gap-[0.65rem]"
      aria-hidden="true"
    >
      <MediaFrame src={IMG.fashion2} className={`${landingMediaCard} col-span-2 row-span-2`} sizes="280px" />
      <MediaFrame src={IMG.watch} className={`${landingMediaCard} col-span-1 row-span-1`} sizes="200px" />
      <MediaFrame
        src={IMG.p5}
        video={VIDEO.beach}
        className={`${landingMediaCard} col-span-1 row-span-2`}
        sizes="200px"
      />
      <MediaFrame src={IMG.skincare} className={`${landingMediaCard} col-span-2 row-span-1`} sizes="200px" />
    </div>
  )
}

export function LandingBento() {
  const cells = BENTO.cells

  return (
    <Section id="platform" border>
      <FadeIn>
        <SectionHeader
          eyebrow={BENTO.eyebrow}
          title={BENTO.title}
          description={BENTO.description}
          align="center"
        />
      </FadeIn>

      <div className="mt-12 grid gap-4 sm:mt-14 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto] lg:gap-[1.15rem]">
        <FadeIn className="lg:col-span-2">
          <article className="flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)+10px)] border border-border bg-background">
            <div className="px-[1.4rem] pt-[1.35rem]">
              <p className={landingEyebrow}>{cells[0].label}</p>
              <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.025em]">{cells[0].title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{cells[0].description}</p>
            </div>
            <div className="mt-5 px-4 pb-4">
              <CreateVisual />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.04} className="lg:min-h-0">
          <article className="flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)+10px)] border border-border bg-background">
            <div className="px-[1.4rem] pt-[1.35rem]">
              <p className={landingEyebrow}>{cells[1].label}</p>
              <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.025em]">{cells[1].title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{cells[1].description}</p>
            </div>
            <div className="mt-4 min-h-0 px-3 pb-3">
              <MockupComposer />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.06} className="lg:min-h-0">
          <article className="flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)+10px)] border border-border bg-background">
            <div className="px-[1.4rem] pt-[1.35rem]">
              <p className={landingEyebrow}>{cells[2].label}</p>
              <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.025em]">{cells[2].title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{cells[2].description}</p>
            </div>
            <div className="mt-4 min-h-0 px-3 pb-3">
              <MockupAnalytics />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.08} className="lg:min-h-0">
          <article className="flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)+10px)] border border-border bg-background p-[1.35rem_1.4rem]">
            <p className={landingEyebrow}>{cells[3].label}</p>
            <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.025em]">{cells[3].title}</h3>
            <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{cells[3].description}</p>
          </article>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:min-h-0">
          <article className="flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)+10px)] border border-border bg-background p-[1.35rem_1.4rem]">
            <p className={landingEyebrow}>{cells[4].label}</p>
            <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.025em]">{cells[4].title}</h3>
            <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{cells[4].description}</p>
          </article>
        </FadeIn>
      </div>
    </Section>
  )
}
