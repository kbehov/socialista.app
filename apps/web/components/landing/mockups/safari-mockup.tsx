import { Safari } from "@/components/ui/safari";
import { cn } from "@/lib/utils";

type SafariMockupProps = {
  url: string;
  imageSrc?: string;
  videoSrc?: string;
  className?: string;
  fade?: boolean;
};

export function SafariMockup({
  url,
  imageSrc,
  videoSrc,
  className,
  fade = true,
}: SafariMockupProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Safari
        url={url}
        mode="simple"
        className="w-full"
        imageSrc={imageSrc}
        videoSrc={videoSrc}
      />
      {fade ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-background via-background/80 to-transparent"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
