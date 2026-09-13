import type { StudioTabId } from "./content";
import { landingMediaCard } from "./landing-classes";
import { IMG, VIDEO } from "./media";
import { MediaFrame } from "./media-frame";
import { UgcClip } from "./ugc-clip";

type StudioPanelProps = {
  id: StudioTabId;
};

export function StudioPanel({ id }: StudioPanelProps) {
  if (id === "images") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <MediaFrame
          src={IMG.studioImages}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 50vw, 280px"
        />
        <MediaFrame
          src={IMG.studioImagesAlt}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 50vw, 280px"
          objectPosition="50% 20%"
        />
      </div>
    );
  }

  if (id === "ads") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <MediaFrame
          src={IMG.adStill}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 50vw, 280px"
          objectPosition="50% 50%"
        />
        <MediaFrame
          src={IMG.adStillAlt}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 50vw, 280px"
          objectPosition="50% 50%"
        />
      </div>
    );
  }

  if (id === "slideshows") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <MediaFrame
          src={IMG.slideshow}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 33vw, 180px"
        />
        <MediaFrame
          src={IMG.studioImages}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 33vw, 180px"
        />
        <MediaFrame
          src={IMG.canvasLifestyle}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 33vw, 180px"
        />
      </div>
    );
  }

  if (id === "videos") {
    return (
      <UgcClip
        poster={IMG.posterUgc5}
        video={VIDEO.talking2}
        className={`${landingMediaCard} mx-auto aspect-[9/16] max-h-[28rem] w-full max-w-[18rem]`}
        sizes="(max-width: 768px) 70vw, 288px"
      />
    );
  }

  if (id === "influencers") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <MediaFrame
          src={IMG.influencer}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 50vw, 280px"
        />
        <UgcClip
          poster={IMG.influencerAlt}
          video={VIDEO.lifestyle}
          className={`${landingMediaCard} aspect-[4/5]`}
          sizes="(max-width: 768px) 50vw, 280px"
        />
      </div>
    );
  }

  return (
    <UgcClip
      poster={IMG.posterUgc1}
      video={VIDEO.talking1}
      className={`${landingMediaCard} mx-auto aspect-[9/16] max-h-[28rem] w-full max-w-[18rem]`}
      sizes="(max-width: 768px) 70vw, 288px"
    />
  );
}
