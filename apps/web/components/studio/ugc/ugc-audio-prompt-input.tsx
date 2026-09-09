'use client'

import {
  PromptInputButton,
  PromptInputProvider,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  STUDIO_HOME_COMPOSER_SURFACE_CLASS,
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import { UgcVoiceDialog } from '@/components/studio/ugc/ugc-voice-dialog'
import { UgcVoiceSettingsDialog } from '@/components/studio/ugc/ugc-voice-settings-dialog'
import { cn } from '@/lib/utils'
import {
  UGC_SCRIPT_MAX_CHARS,
  ugcClipAudioTakes,
  ugcClipShowsOnScreenText,
  ugcClipShowsScript,
  ugcResolvedClipVoice,
  type UgcClip,
  type UgcClipVoice,
  type UgcProject,
} from '@socialista/types'
import { AudioLinesIcon, ChevronDownIcon, MicIcon, Settings2Icon, SparklesIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const CHAR_RING_SIZE = 28
const CHAR_RING_STROKE = 2
const CHAR_RING_RADIUS = (CHAR_RING_SIZE - CHAR_RING_STROKE) / 2
const CHAR_RING_CIRCUMFERENCE = 2 * Math.PI * CHAR_RING_RADIUS

type UgcAudioPromptInputProps = {
  project: UgcProject
  clip: UgcClip
  writingScript?: boolean
  generatingAudio?: boolean
  busy?: boolean
  onScriptChange: (text: string) => void
  onWriteScript: () => void
  onVoiceChange: (voice: UgcClipVoice) => void
  onGenerateAudio: (script: string) => void
}

function initialScriptForClip(clip: UgcClip) {
  const takeScript =
    ugcClipAudioTakes(clip).find(take => take.audioUrl === clip.audioUrl)?.scriptText?.trim() ?? ''
  return (takeScript || clip.script?.text || '').slice(0, UGC_SCRIPT_MAX_CHARS)
}

export function UgcAudioPromptInput(props: UgcAudioPromptInputProps) {
  const showsScript = ugcClipShowsScript(props.clip.type)
  const isHook = ugcClipShowsOnScreenText(props.clip.type)

  if (!showsScript) {
    return (
      <div className="px-1 py-4 text-center">
        <p className="text-[13px] font-medium tracking-tight">This scene has no talking</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
          Product-only shots skip voiceover. Switch to a talking scene to write a script, or add a text hook.
        </p>
      </div>
    )
  }

  const composerKey = `${props.clip.id}:${props.clip.audioUrl ?? ''}:${props.clip.type}`

  return (
    <PromptInputProvider key={composerKey} initialInput={initialScriptForClip(props.clip)}>
      <UgcAudioPromptComposer {...props} isHook={isHook} />
    </PromptInputProvider>
  )
}

function UgcAudioPromptComposer({
  project,
  clip,
  writingScript,
  generatingAudio,
  busy,
  onScriptChange,
  onWriteScript,
  onVoiceChange,
  onGenerateAudio,
  isHook,
}: UgcAudioPromptInputProps & { isHook: boolean }) {
  const { textInput } = usePromptInputController()
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const wasWritingRef = useRef(false)
  const voice = ugcResolvedClipVoice(project, clip)
  const enabled = voice.enabled !== false
  const pending = Boolean(generatingAudio || writingScript || busy)
  const used = textInput.value.length
  const remaining = Math.max(0, UGC_SCRIPT_MAX_CHARS - used)
  const voiceLabel = voice.voiceName?.trim() || 'Choose voice'

  useEffect(() => {
    if (wasWritingRef.current && !writingScript && clip.script?.text) {
      textInput.setInput(clip.script.text.slice(0, UGC_SCRIPT_MAX_CHARS))
    }
    wasWritingRef.current = Boolean(writingScript)
  }, [clip.script?.text, textInput, writingScript])

  const handlePromptChange = () => {
    const next = textInput.value.slice(0, UGC_SCRIPT_MAX_CHARS)
    if (next !== textInput.value) {
      textInput.setInput(next)
      return
    }
    if (next === (clip.script?.text ?? '')) return
    if (!next) return
    onScriptChange(next)
  }

  const handleSubmit = (message: PromptInputMessage) => {
    const script = message.text.trim().slice(0, UGC_SCRIPT_MAX_CHARS)
    if (!script) return
    if (isHook) {
      onScriptChange(script)
      return
    }
    if (!enabled) return
    onGenerateAudio(script)
  }

  return (
    <div className="space-y-1.5">
      <StudioPromptComposer
        models={[]}
        selectedModelId=""
        onSelectedModelChange={() => {}}
        attachments={[]}
        onAttachmentsChange={() => {}}
        attachSources={[]}
        maxAttachments={0}
        hideModelSelector
        allowEmptyModels
        compact
        pending={pending}
        disabled={pending || (!isHook && !enabled)}
        placeholder={isHook ? 'Stop scrolling — this is the one.' : 'Hey — wait until you try this…'}
        submitLabel={isHook ? 'Save' : clip.audioUrl ? 'Regenerate' : 'Generate'}
        submitAppearance="send"
        surfaceClassName={STUDIO_HOME_COMPOSER_SURFACE_CLASS}
        maxLength={UGC_SCRIPT_MAX_CHARS}
        onPromptChange={handlePromptChange}
        onSubmit={handleSubmit}
        tools={
          <>
            {isHook ? null : (
              <>
                <StudioInputActionTooltip label="Choose ElevenLabs voice">
                  <PromptInputButton
                    type="button"
                    size="xs"
                    disabled={pending}
                    className={cn(STUDIO_TOOL_BUTTON_CLASS, STUDIO_TOOL_BUTTON_ACTIVE_CLASS, 'max-w-[9.5rem]')}
                    onClick={() => setVoiceOpen(true)}
                  >
                    <MicIcon className="size-3.5 shrink-0" />
                    <span className="truncate text-[12px] font-medium">{voiceLabel}</span>
                    <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
                  </PromptInputButton>
                </StudioInputActionTooltip>

                <StudioInputActionTooltip label="Voice settings">
                  <PromptInputButton
                    type="button"
                    size="xs"
                    disabled={pending}
                    className={STUDIO_TOOL_BUTTON_CLASS}
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings2Icon className="size-3.5 shrink-0" />
                    <span className="text-[12px] font-medium">Settings</span>
                  </PromptInputButton>
                </StudioInputActionTooltip>
              </>
            )}

            <StudioInputActionTooltip label={isHook ? 'Write hook with AI' : 'Write script with AI'}>
              <PromptInputButton
                type="button"
                size="xs"
                disabled={pending}
                className={STUDIO_TOOL_BUTTON_CLASS}
                onClick={onWriteScript}
              >
                {writingScript ? (
                  <AudioLinesIcon className="size-3.5 shrink-0 animate-pulse" />
                ) : (
                  <SparklesIcon className="size-3.5 shrink-0" />
                )}
                <span className="text-[12px] font-medium">Write</span>
              </PromptInputButton>
            </StudioInputActionTooltip>

            <UgcScriptCharMeter used={used} remaining={remaining} />
          </>
        }
      />

      <UgcVoiceDialog open={voiceOpen} value={voice} onOpenChange={setVoiceOpen} onSelect={onVoiceChange} />
      <UgcVoiceSettingsDialog
        key={`${clip.id}:${voice.voiceId ?? ''}`}
        open={settingsOpen}
        value={voice}
        disabled={pending}
        onOpenChange={setSettingsOpen}
        onChange={onVoiceChange}
      />
    </div>
  )
}

function UgcScriptCharMeter({ used, remaining }: { used: number; remaining: number }) {
  const ratio = Math.min(1, used / UGC_SCRIPT_MAX_CHARS)
  const warn = remaining <= 20
  const empty = remaining <= 0
  const offset = CHAR_RING_CIRCUMFERENCE * (1 - ratio)

  return (
    <span
      role="meter"
      aria-valuemin={0}
      aria-valuemax={UGC_SCRIPT_MAX_CHARS}
      aria-valuenow={used}
      aria-label={`${remaining} characters left`}
      title={`${remaining} characters left`}
      className="relative inline-flex size-7 shrink-0 items-center justify-center"
    >
      <svg width={CHAR_RING_SIZE} height={CHAR_RING_SIZE} viewBox={`0 0 ${CHAR_RING_SIZE} ${CHAR_RING_SIZE}`} className="-rotate-90">
        <circle
          cx={CHAR_RING_SIZE / 2}
          cy={CHAR_RING_SIZE / 2}
          r={CHAR_RING_RADIUS}
          fill="none"
          className="text-muted-foreground/20"
          stroke="currentColor"
          strokeWidth={CHAR_RING_STROKE}
        />
        <circle
          cx={CHAR_RING_SIZE / 2}
          cy={CHAR_RING_SIZE / 2}
          r={CHAR_RING_RADIUS}
          fill="none"
          className={cn(
            'motion-reduce:transition-none',
            empty ? 'text-destructive' : warn ? 'text-amber-500' : 'text-foreground/65',
          )}
          stroke="currentColor"
          strokeDasharray={CHAR_RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={CHAR_RING_STROKE}
        />
      </svg>
      <span
        className={cn(
          'absolute font-medium tabular-nums leading-none tracking-tight',
          remaining >= 100 ? 'text-[7px]' : 'text-[9px]',
          empty ? 'text-destructive' : warn ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
        )}
      >
        {remaining}
      </span>
    </span>
  )
}
