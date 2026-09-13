import { Iphone } from "@/components/ui/iphone";
import Image from "next/image";

import { INFLUENCER_SECTION } from "./content";
import { IMG, VIDEO } from "./media";

function InfluencerPhoneSocialOverlay() {
  const { mockup } = INFLUENCER_SECTION;

  return (
    <>
      <div className="absolute inset-x-0 top-0 px-[4.5cqw] pt-[14cqw]">
        <div className="inline-flex max-w-full items-center gap-[2.1cqw]">
          <span className="flex size-[5cqw] shrink-0 items-center justify-center rounded-full bg-black">
            <span className="relative block size-[3.15cqw]">
              <Image
                src="/socialista-logo.webp"
                alt=""
                fill
                sizes="20px"
                className="object-contain invert"
              />
            </span>
          </span>
          <span className="truncate text-[3.55cqw] font-medium tracking-[-0.01em] text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.45)]">
            {mockup.badge}
          </span>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 px-[4.5cqw] pb-[7cqw] pt-[10cqw]"
        style={{
          background:
            "linear-gradient(to top, rgb(0 0 0 / 0.62), rgb(0 0 0 / 0.18) 62%, transparent)",
        }}
      >
        <p className="text-[2.65cqw] font-semibold leading-none text-white/90">
          {mockup.username}
        </p>
        <p className="mt-[1.5cqw] max-w-[78%] text-[2.95cqw] font-medium leading-[1.35] tracking-[-0.015em] text-white">
          {mockup.caption}
        </p>
        <p className="mt-[1.2cqw] text-[2.45cqw] font-medium leading-none text-white/72">
          {mockup.hashtags}
        </p>
      </div>
    </>
  );
}

type InfluencerPhoneMockupProps = {
  className?: string;
};

export function InfluencerPhoneMockup({ className }: InfluencerPhoneMockupProps) {
  return (
    <Iphone
      variant="black"
      bezel="thin"
      videoSrc={VIDEO.influencerDemo}
      src={IMG.influencer}
      className={
        className ??
        "w-[15rem] shrink-0 drop-shadow-[0_28px_56px_-18px_color-mix(in_oklch,var(--foreground)_28%,transparent)] sm:w-[17rem]"
      }
    >
      <InfluencerPhoneSocialOverlay />
    </Iphone>
  );
}
