"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MAX_CONCURRENT = 6;
let activePlayers = 0;

function acquireSlot() {
  if (activePlayers >= MAX_CONCURRENT) return false;
  activePlayers += 1;
  return true;
}

function releaseSlot() {
  activePlayers = Math.max(0, activePlayers - 1);
}

type UgcClipProps = {
  poster: string;
  video?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
};

export function UgcClip({
  poster,
  video,
  alt = "",
  className,
  sizes = "(max-width: 768px) 50vw, 240px",
  priority = false,
  objectPosition = "50% 18%",
}: UgcClipProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const slotRef = useRef(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const canPlayVideo = Boolean(video) && !reduceMotion;

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !canPlayVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.2, rootMargin: "64px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canPlayVideo]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlayVideo) return;

    if (inView) {
      if (!slotRef.current) {
        if (!acquireSlot()) return;
        slotRef.current = true;
      }
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      void el.play().catch(() => {});
      return;
    }

    el.pause();
    if (slotRef.current) {
      releaseSlot();
      slotRef.current = false;
    }
  }, [canPlayVideo, inView]);

  useEffect(() => {
    return () => {
      if (slotRef.current) {
        releaseSlot();
        slotRef.current = false;
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative overflow-hidden bg-surface-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px motion-reduce:transform-none",
        className,
      )}
    >
      <Image
        src={poster}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition }}
      />
      {canPlayVideo ? (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => {
            const node = videoRef.current;
            if (!node || !slotRef.current) return;
            node.muted = true;
            void node.play().catch(() => {});
          }}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-300",
            playing ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition }}
        />
      ) : null}
    </div>
  );
}
