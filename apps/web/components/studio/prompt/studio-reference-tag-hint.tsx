"use client";

import {
  referenceTag,
  referenceTagTone,
} from "@/lib/studio/prompt/reference-tags";
import { cn } from "@/lib/utils";

function TagChip({ index }: { index: number }) {
  const tone = referenceTagTone(index);

  return (
    <span className={cn("tabular-nums tracking-[-0.015em]", tone.hint)}>
      {referenceTag(index)}
    </span>
  );
}

export function StudioReferenceTagHint({
  attachmentCount,
  variant = "image",
}: {
  attachmentCount: number;
  variant?: "image" | "static-ad";
}) {
  const isStaticAd = variant === "static-ad";
  const hasAttachments = attachmentCount > 0;

  return (
    <p className="px-0.5 text-[12px] leading-[1.55] tracking-[-0.01em] text-black/56 dark:text-white/56">
      {hasAttachments ? (
        <>
          Type <span className="font-medium text-foreground/70">@</span> or tap
          a thumbnail.
          {isStaticAd ? (
            <>
              {" "}
              Example: recreate the template with the creator from{" "}
              <TagChip index={0} /> holding the product from{" "}
              <TagChip index={1} />.
            </>
          ) : (
            <>
              {" "}
              Example: the creator from <TagChip index={0} /> holding the
              product from <TagChip index={1} />.
            </>
          )}
        </>
      ) : isStaticAd ? (
        <>
          Attach a product, creator, or mix, then tag with{" "}
          <TagChip index={0} /> and <TagChip index={1} />. Type{" "}
          <span className="font-medium text-foreground/70">@</span> to insert.
        </>
      ) : (
        <>
          Attach a reference, then tag it with <TagChip index={0} /> or{" "}
          <TagChip index={1} />. Type{" "}
          <span className="font-medium text-foreground/70">@</span> to insert.
        </>
      )}
    </p>
  );
}
