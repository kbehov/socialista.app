"use client";

import {
  referenceTagMentionClass,
  splitPromptByReferenceTags,
} from "@/lib/studio/prompt/reference-tags";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";

export const PROMPT_FIELD_STYLE: CSSProperties = {
  display: "block",
  fontFamily: "inherit",
  fontSize: 15,
  fontWeight: 400,
  lineHeight: "25px",
  letterSpacing: "-0.18px",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  tabSize: 4,
};

const MIRROR_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontVariant",
  "fontFeatureSettings",
  "fontKerning",
  "letterSpacing",
  "wordSpacing",
  "textAlign",
  "textIndent",
  "textTransform",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "boxSizing",
  "whiteSpace",
  "overflowWrap",
  "wordBreak",
] as const;

type StudioPromptHighlightProps = {
  value: string;
  attachmentCount: number;
  emphasizedIndex?: number | null;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  className?: string;
};

function cssPropName(prop: string): string {
  return prop.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function copyTextMetrics(from: CSSStyleDeclaration, to: HTMLElement) {
  for (const prop of MIRROR_STYLE_PROPS) {
    to.style.setProperty(cssPropName(prop), from[prop]);
  }
  to.style.setProperty("tab-size", from.getPropertyValue("tab-size"));
}

function measureTextareaLineHeight(textarea: HTMLTextAreaElement): number {
  const computed = getComputedStyle(textarea);
  const probe = document.createElement("textarea");
  probe.setAttribute("aria-hidden", "true");
  probe.tabIndex = -1;
  probe.rows = 1;
  probe.value = "x";
  copyTextMetrics(computed, probe);
  probe.style.position = "absolute";
  probe.style.left = "-9999px";
  probe.style.top = "0";
  probe.style.width = `${textarea.clientWidth}px`;
  probe.style.height = "auto";
  probe.style.minHeight = "0";
  probe.style.maxHeight = "none";
  probe.style.overflow = "hidden";
  probe.style.resize = "none";
  probe.style.lineHeight = computed.lineHeight;
  probe.style.setProperty("field-sizing", "fixed");

  document.body.appendChild(probe);
  const oneLine = probe.scrollHeight;
  probe.value = "x\nx";
  const twoLines = probe.scrollHeight;
  probe.remove();

  const delta = twoLines - oneLine;
  if (delta > 0) return delta;

  const parsed = Number.parseFloat(computed.lineHeight);
  return Number.isFinite(parsed) ? parsed : 25;
}

function syncMirror(
  textarea: HTMLTextAreaElement,
  overlay: HTMLElement,
  mirror: HTMLElement,
) {
  const computed = getComputedStyle(textarea);

  overlay.style.top = `${textarea.offsetTop}px`;
  overlay.style.left = `${textarea.offsetLeft}px`;
  overlay.style.width = `${textarea.offsetWidth}px`;
  overlay.style.height = `${textarea.offsetHeight}px`;

  copyTextMetrics(computed, mirror);
  mirror.style.lineHeight = `${measureTextareaLineHeight(textarea)}px`;
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.transform = `translateY(${-textarea.scrollTop}px)`;
}

export function StudioPromptHighlight({
  value,
  attachmentCount,
  emphasizedIndex = null,
  textareaRef,
  className,
}: StudioPromptHighlightProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLPreElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !overlay || !mirror) return;

    const syncLayout = () => syncMirror(textarea, overlay, mirror);
    const syncScroll = () => {
      mirror.style.transform = `translateY(${-textarea.scrollTop}px)`;
    };

    syncLayout();
    textarea.addEventListener("scroll", syncScroll, { passive: true });
    const observer = new ResizeObserver(syncLayout);
    observer.observe(textarea);

    return () => {
      textarea.removeEventListener("scroll", syncScroll);
      observer.disconnect();
    };
  }, [textareaRef, value]);

  if (!value) return null;

  const segments = splitPromptByReferenceTags(value);

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="pointer-events-none absolute z-0 overflow-hidden"
    >
      <pre
        ref={mirrorRef}
        style={PROMPT_FIELD_STYLE}
        className={cn("m-0 border-0 bg-transparent text-transparent", className)}
      >
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return <span key={`text-${index}`}>{segment.value}</span>;
          }

          const matched =
            segment.index >= 0 && segment.index < attachmentCount;

          return (
            <span
              key={`tag-${index}-${segment.index}-${segment.number}`}
              className={cn(
                referenceTagMentionClass(
                  segment.index,
                  matched,
                  emphasizedIndex === segment.index,
                ),
                "text-transparent",
              )}
            >
              {segment.value}
            </span>
          );
        })}
        {"\n"}
      </pre>
    </div>
  );
}
