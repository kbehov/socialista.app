"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { AnimatePresence, motion, type MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number | string }>;

interface WordRotateProps {
  words: string[];
  icons?: IconComponent[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
  wrapperClassName?: string;
  iconClassName?: string;
}

export function WordRotate({
  words,
  icons,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
  wrapperClassName,
  iconClassName,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  const Icon = icons?.[index];
  const word = words[index];

  return (
    <div className={cn("overflow-hidden py-2", wrapperClassName)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className={cn("inline-flex items-center gap-2", className)}
          {...motionProps}
        >
          {Icon ? (
            <Icon
              className={cn("size-4 shrink-0", iconClassName)}
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : null}
          {word}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
