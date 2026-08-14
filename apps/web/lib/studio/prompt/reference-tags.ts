export const REFERENCE_TAG_PREFIX = "@image";

export type ReferenceTagMatch = {
  value: string;
  number: number;
  index: number;
  start: number;
  end: number;
};

export type PromptSegment =
  | { type: "text"; value: string }
  | { type: "tag"; value: string; number: number; index: number };

export type ActiveMention = {
  start: number;
  query: string;
};

export const REFERENCE_TAG_TONES = [
  {
    mention:
      "rounded-[0.25rem] bg-sky-500/16 text-sky-800 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:text-sky-200",
    mentionStrong:
      "rounded-[0.25rem] bg-sky-500/24 text-sky-900 outline outline-1 outline-sky-500/40 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:text-sky-100",
    chip: "ring-sky-500/65",
    caption: "text-sky-700 dark:text-sky-300",
    hint: "rounded-[0.3125rem] bg-sky-500/14 px-1 py-px font-medium text-sky-800 dark:text-sky-200",
  },
  {
    mention:
      "rounded-[0.25rem] bg-violet-500/16 text-violet-800 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:text-violet-200",
    mentionStrong:
      "rounded-[0.25rem] bg-violet-500/24 text-violet-900 outline outline-1 outline-violet-500/40 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:text-violet-100",
    chip: "ring-violet-500/65",
    caption: "text-violet-700 dark:text-violet-300",
    hint: "rounded-[0.3125rem] bg-violet-500/14 px-1 py-px font-medium text-violet-800 dark:text-violet-200",
  },
  {
    mention:
      "rounded-[0.25rem] bg-amber-500/16 text-amber-900 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:text-amber-200",
    mentionStrong:
      "rounded-[0.25rem] bg-amber-500/24 text-amber-950 outline outline-1 outline-amber-500/45 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:text-amber-100",
    chip: "ring-amber-500/65",
    caption: "text-amber-800 dark:text-amber-300",
    hint: "rounded-[0.3125rem] bg-amber-500/14 px-1 py-px font-medium text-amber-900 dark:text-amber-200",
  },
] as const;

const UNMATCHED_MENTION_CLASS =
  "rounded-[0.25rem] bg-destructive/10 text-destructive/80 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]";

export function referenceTag(index: number): string {
  return `${REFERENCE_TAG_PREFIX}${index + 1}`;
}

export function referenceTagTone(index: number) {
  return REFERENCE_TAG_TONES[index % REFERENCE_TAG_TONES.length]!;
}

export function referenceTagMentionClass(
  index: number,
  matched: boolean,
  emphasized: boolean,
): string {
  if (!matched) return UNMATCHED_MENTION_CLASS;
  const tone = referenceTagTone(index);
  return emphasized ? tone.mentionStrong : tone.mention;
}

export function parseReferenceTags(text: string): ReferenceTagMatch[] {
  const matches: ReferenceTagMatch[] = [];

  for (const match of text.matchAll(/@image(\d+)/gi)) {
    const number = Number(match[1]);
    if (!Number.isInteger(number) || number < 1) continue;
    const start = match.index ?? 0;
    matches.push({
      value: match[0],
      number,
      index: number - 1,
      start,
      end: start + match[0].length,
    });
  }

  return matches;
}

export function splitPromptByReferenceTags(text: string): PromptSegment[] {
  const tags = parseReferenceTags(text);
  if (tags.length === 0) return [{ type: "text", value: text }];

  const segments: PromptSegment[] = [];
  let cursor = 0;

  for (const tag of tags) {
    if (tag.start > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, tag.start) });
    }
    segments.push({
      type: "tag",
      value: tag.value,
      number: tag.number,
      index: tag.index,
    });
    cursor = tag.end;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) });
  }

  return segments;
}

export function taggedAttachmentIndices(
  text: string,
  attachmentCount: number,
): Set<number> {
  const tagged = new Set<number>();
  for (const tag of parseReferenceTags(text)) {
    if (tag.index >= 0 && tag.index < attachmentCount) {
      tagged.add(tag.index);
    }
  }
  return tagged;
}

export function getActiveMention(
  text: string,
  cursor: number,
): ActiveMention | null {
  const before = text.slice(0, cursor);
  const match = before.match(/(?:^|[\s([{'"])@([a-zA-Z0-9_-]*)$/);
  if (!match) return null;

  const query = match[1] ?? "";
  return {
    start: before.length - query.length - 1,
    query,
  };
}

export function mentionMatchesAttachment(
  query: string,
  index: number,
  label: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const tag = referenceTag(index).toLowerCase();
  const token = tag.slice(1);

  return (
    tag.includes(normalized) ||
    token.includes(normalized) ||
    String(index + 1) === normalized ||
    label.toLowerCase().includes(normalized)
  );
}

function padTag(before: string, after: string, tag: string) {
  const leading = before.length > 0 && !/\s$/.test(before) ? " " : "";
  const trailing = after.length > 0 && !/^\s/.test(after) ? " " : "";
  return `${leading}${tag}${trailing}`;
}

export function replaceMentionWithTag(
  text: string,
  mentionStart: number,
  cursor: number,
  tag: string,
): { next: string; cursor: number } {
  const before = text.slice(0, mentionStart);
  const after = text.slice(cursor);
  const inserted = padTag(before, after, tag);
  return {
    next: `${before}${inserted}${after}`,
    cursor: before.length + inserted.length,
  };
}

export function insertTagAtCursor(
  text: string,
  start: number,
  end: number,
  tag: string,
): { next: string; cursor: number } {
  const before = text.slice(0, start);
  const after = text.slice(end);
  const inserted = padTag(before, after, tag);
  return {
    next: `${before}${inserted}${after}`,
    cursor: before.length + inserted.length,
  };
}
