'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ClapperboardIcon,
  LayoutTemplateIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react'
import {
  NextStep,
  NextStepProvider,
  useNextStep,
  type CardComponentProps,
  type Tour,
} from 'nextstepjs'
import { useCallback, useEffect, type ReactNode } from 'react'

export const UGC_STUDIO_TOUR_NAME = 'ugc-studio'
const UGC_TOUR_STORAGE_KEY = 'ugc-studio-tour:v1'
const DESKTOP_TOUR_QUERY = '(min-width: 1024px)'
const TOUR_START_DELAY_MS = 600

const STEP_TARGET = {
  pointerPadding: 10,
  pointerRadius: 10,
  cardOffset: 16,
  selectorRetryAttempts: 5,
  selectorRetryDelay: 200,
  disableInteraction: true,
} as const

function readTourDone(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(UGC_TOUR_STORAGE_KEY) === 'done'
  } catch {
    return true
  }
}

function markTourDone(): void {
  try {
    localStorage.setItem(UGC_TOUR_STORAGE_KEY, 'done')
  } catch {
    // ignore private mode / quota
  }
}

function handleTourEnd(): void {
  markTourDone()
}

const ugcStudioTour: Tour = {
  tour: UGC_STUDIO_TOUR_NAME,
  steps: [
    {
      icon: <SparklesIcon className="size-4" strokeWidth={1.75} />,
      title: 'Make a UGC ad, scene by scene',
      content: (
        <p>
          This studio turns a product and creator into a talking-head ad. Set the campaign
          once, generate each scene, then finish into a video you can edit.
        </p>
      ),
      pointerPadding: 0,
      pointerRadius: 16,
      disableInteraction: true,
    },
    {
      icon: <SlidersHorizontalIcon className="size-4" strokeWidth={1.75} />,
      title: 'Campaign settings',
      content: (
        <p>
          Pick the product, creator, voice, and aspect ratio here. They stay shared across
          every scene so the ad feels like one shoot.
        </p>
      ),
      selector: '#ugc-tour-settings',
      side: 'left',
      ...STEP_TARGET,
    },
    {
      icon: <LayoutTemplateIcon className="size-4" strokeWidth={1.75} />,
      title: 'Scenes are the beats',
      content: (
        <p>
          Add scenes, apply a campaign template, or tap Plan and let AI draft the whole
          sequence. Drag to reorder the story.
        </p>
      ),
      selector: '#ugc-tour-scenes',
      side: 'right',
      ...STEP_TARGET,
    },
    {
      icon: <WandSparklesIcon className="size-4" strokeWidth={1.75} />,
      title: 'Build one scene at a time',
      content: (
        <p>
          Write or generate the line, create a voiceover, make stills, then turn a still
          into video. Repeat for each scene.
        </p>
      ),
      selector: '#ugc-tour-workbench',
      side: 'bottom',
      ...STEP_TARGET,
    },
    {
      icon: <ClapperboardIcon className="size-4" strokeWidth={1.75} />,
      title: 'Finish when every scene has video',
      content: (
        <p>
          Finish composes the scenes into one clip and opens the video editor for trims,
          captions, and final polish.
        </p>
      ),
      selector: '#ugc-tour-finish',
      side: 'bottom-right',
      ...STEP_TARGET,
    },
  ],
}

function UgcTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return (
    <div
      className="relative w-[min(20.5rem,calc(100vw-2rem))] rounded-xl border bg-popover p-3.5 text-popover-foreground shadow-lg [&_[data-name=nextstep-arrow]]:text-popover"
      role="dialog"
      aria-label={step.title}
    >
      <div className="mb-2 flex items-start gap-2.5">
        {step.icon ? (
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
            {step.icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium tracking-[-0.01em]">{step.title}</p>
          <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
            {currentStep + 1} of {totalSteps}
          </p>
        </div>
        {skipTour ? (
          <button
            type="button"
            onClick={skipTour}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss tour"
          >
            <XIcon className="size-3.5" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      <div className="text-[12px] leading-relaxed text-muted-foreground">{step.content}</div>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1" aria-hidden>
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              className={cn(
                'size-1.5 rounded-full',
                index === currentStep ? 'bg-foreground' : 'bg-muted-foreground/25',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {skipTour && !isLast ? (
            <Button type="button" size="xs" variant="ghost" className="h-7 px-2 text-xs" onClick={skipTour}>
              Skip
            </Button>
          ) : null}
          {!isFirst ? (
            <Button type="button" size="xs" variant="ghost" className="h-7 px-2 text-xs" onClick={prevStep}>
              Back
            </Button>
          ) : null}
          <Button type="button" size="xs" className="h-7 px-3 text-xs" onClick={nextStep}>
            {isLast ? 'Got it' : 'Next'}
          </Button>
        </div>
      </div>
      {arrow}
    </div>
  )
}

function UgcTourAutoStart() {
  const { startNextStep } = useNextStep()

  useEffect(() => {
    if (readTourDone()) return
    if (!window.matchMedia(DESKTOP_TOUR_QUERY).matches) return

    const timeoutId = window.setTimeout(() => {
      startNextStep(UGC_STUDIO_TOUR_NAME)
    }, TOUR_START_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [startNextStep])

  return null
}

export function useStartUgcStudioTour() {
  const { startNextStep } = useNextStep()
  return useCallback(() => startNextStep(UGC_STUDIO_TOUR_NAME), [startNextStep])
}

export function UgcStudioTour({ children }: { children: ReactNode }) {
  return (
    <NextStepProvider>
      <div className="ugc-studio-tour flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <NextStep
          steps={[ugcStudioTour]}
          cardComponent={UgcTourCard}
          onComplete={handleTourEnd}
          onSkip={handleTourEnd}
          shadowRgb="0, 0, 0"
          shadowOpacity="0.55"
          displayArrow
          scrollToTop={false}
          disableConsoleLogs
        >
          <UgcTourAutoStart />
          {children}
        </NextStep>
      </div>
    </NextStepProvider>
  )
}
