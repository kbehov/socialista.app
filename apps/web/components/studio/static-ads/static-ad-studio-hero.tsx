import Image from 'next/image'

export function StaticAdStudioHero() {
  return (
    <header className="px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/12">
        <div className="relative min-h-[11rem] sm:min-h-[12.5rem] lg:min-h-[13.5rem]">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image
              src="/socialista-static-ads.webp"
              alt=""
              fill
              priority
              quality={88}
              sizes="(max-width: 768px) 100vw, 1024px"
              className="select-none object-cover object-[50%_38%]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/32 to-black/8" />
            <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/15 to-transparent sm:from-black/45" />
          </div>

          <div className="relative flex min-h-[11rem] flex-col justify-end px-5 pb-5 pt-10 text-left sm:min-h-[12.5rem] sm:px-7 sm:pb-6 sm:pt-12 lg:min-h-[13.5rem] lg:px-8">
            <p className="text-[12px] font-medium tracking-[-0.015em] text-white/64">Static ads</p>
            <h1 className="mt-1.5 max-w-[16rem] text-[clamp(1.75rem,4.5vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-white sm:max-w-none">
              <span>Ads</span>
              <span className="text-white/58"> in seconds.</span>
            </h1>
            <p className="mt-2 max-w-[18rem] text-[14px] leading-[1.5] tracking-[-0.01em] text-white/72 sm:max-w-sm">
              One product photo. Scroll-stopping creatives — ready to run.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
