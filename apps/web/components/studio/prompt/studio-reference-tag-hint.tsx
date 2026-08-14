"use client";

import {
  referenceTag,
  referenceTagTone,
} from "@/lib/studio/prompt/reference-tags";
import { cn } from "@/lib/utils";

function TagChip({ index }: { index: number }) {
  const tone = referenceTagTone(index);

  return (
    <span className={cn("font-medium", tone.hint)}>
      {referenceTag(index)}
    </span>
  );
}

export function StudioReferenceTagHint({
  attachmentCount,
}: {
  attachmentCount: number;
}) {
  return (
    <p className="px-0.5 text-[12px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
      {attachmentCount > 0 ? (
        <>
          Type <span className="font-medium text-foreground/80">@</span> or tap
          a reference. Example: the person from <TagChip index={0} /> is holding
          the product from <TagChip index={1} />.
        </>
      ) : (
        <>
          Attach references, then tag them with <TagChip index={0} /> and{" "}
          <TagChip index={1} />.
        </>
      )}
    </p>
  );
}
