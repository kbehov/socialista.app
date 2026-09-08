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
  ugcClipShowsScript,
  ugcResolvedClipVoice,
  ugcScriptTargetChars,
  type UgcClip,
  type UgcClipVoice,
  type UgcProject,
} from '@socialista/types'
import { AudioLinesIcon, ChevronDownIcon, MicIcon, Settings2Icon, SparklesIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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

export function UgcAudioPromptInput(props: UgcAudioPromptInputProps) {
  const showsScript = ugcClipShowsScript(props.clip.type)

  if (!showsScript) {
    return (
      <div className="px-1 py-4 text-center">
        <p className="text-[13px] font-medium tracking-tight">This scene has no talking</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
          B-roll and product-only shots skip voiceover. Switch to a talking scene to write a script.
        </p>
      </div>
    )
  }

  return (
    <PromptInputProvider key={props.clip.id} initialInput={props.clip.script?.text ?? ''}>
      <UgcAudioPromptComposer {...props} />
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
}: UgcAudioPromptInputProps) {
  const { textInput } = usePromptInputController()
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const wasWritingRef = useRef(false)
  const selectedAudioKeyRef = useRef(`${clip.id}:${clip.audioUrl ?? ''}`)
  const voice = ugcResolvedClipVoice(project, clip)
  const enabled = voice.enabled !== false
  const pending = Boolean(generatingAudio || writingScript || busy)
  const target = ugcScriptTargetChars(clip.durationSec)
  const voiceLabel = voice.voiceName?.trim() || 'Choose voice'
  const selectedAudioUrl = clip.audioUrl ?? ''
  const selectedTakeScript =
    ugcClipAudioTakes(clip).find(take => take.audioUrl === clip.audioUrl)?.scriptText?.trim() ?? ''

  useEffect(() => {
    if (wasWritingRef.current && !writingScript && clip.script?.text) {
      textInput.setInput(clip.script.text.slice(0, UGC_SCRIPT_MAX_CHARS))
    }
    wasWritingRef.current = Boolean(writingScript)
  }, [clip.script?.text, textInput, writingScript])

  useEffect(() => {
    const key = `${clip.id}:${selectedAudioUrl}`
    if (selectedAudioKeyRef.current === key) return
    selectedAudioKeyRef.current = key
    if (writingScript || generatingAudio) return
    const next = (selectedTakeScript || clip.script?.text || '').slice(0, UGC_SCRIPT_MAX_CHARS)
    if (next === textInput.value) return
    textInput.setInput(next)
  }, [clip.id, clip.script?.text, generatingAudio, selectedAudioUrl, selectedTakeScript, textInput, writingScript])

  useEffect(() => {
    const next = textInput.value.slice(0, UGC_SCRIPT_MAX_CHARS)
    if (next !== textInput.value) {
      textInput.setInput(next)
      return
    }
    if (next === (clip.script?.text ?? '')) return
    if (!next) return
    onScriptChange(next)
  }, [clip.script?.text, onScriptChange, textInput, textInput.value])

  useEffect(() => {
    if (generatingAudio && !textInput.value && clip.script?.text) {
      textInput.setInput(clip.script.text.slice(0, UGC_SCRIPT_MAX_CHARS))
    }
  }, [clip.script?.text, generatingAudio, textInput, textInput.value])

  const handleSubmit = (message: PromptInputMessage) => {
    const script = message.text.trim().slice(0, UGC_SCRIPT_MAX_CHARS)
    if (!script || !enabled) return
    onGenerateAudio(script)
  }

  return (
    <div className="space-y-1.5">
      <p className="px-0.5 text-[11px] text-muted-foreground">
        One breath · ~{target} characters for a {clip.durationSec}s scene
      </p>

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
        disabled={pending || !enabled}
        placeholder="Hey — wait until you try this…"
        submitLabel={clip.audioUrl ? 'Regenerate' : 'Generate'}
        submitAppearance="send"
        surfaceClassName={STUDIO_HOME_COMPOSER_SURFACE_CLASS}
        onSubmit={handleSubmit}
        tools={
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

            <StudioInputActionTooltip label="Write script with AI">
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
