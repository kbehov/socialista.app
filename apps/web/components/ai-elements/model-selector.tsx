'use client'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

export type ModelSelectorProps = ComponentProps<typeof Dialog>

export const ModelSelector = (props: ModelSelectorProps) => <Dialog {...props} />

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => (
  <DialogTrigger {...props} />
)

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode
}

export const ModelSelectorContent = ({
  className,
  children,
  title = 'Choose model',
  showCloseButton = false,
  ...props
}: ModelSelectorContentProps) => (
  <DialogContent
    aria-describedby={undefined}
    showCloseButton={showCloseButton}
    className={cn(
      'gap-0 overflow-hidden rounded-2xl border border-border/50 bg-background p-0',
      'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-16px_rgba(0,0,0,0.18)]',
      'sm:max-w-[26rem]',
      'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_28px_56px_-16px_rgba(0,0,0,0.55)]',
      className,
    )}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command
      className={cn(
        'rounded-none border-0 bg-transparent p-0 text-foreground shadow-none',
        '**:data-[slot=command-input-wrapper]:border-b **:data-[slot=command-input-wrapper]:border-border/40',
        '**:data-[slot=command-input-wrapper]:!p-0 **:data-[slot=command-input-wrapper]:px-3! **:data-[slot=command-input-wrapper]:py-2.5!',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:h-9',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:rounded-xl',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:border-border/40',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:bg-muted/25',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:shadow-none',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:ring-0',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:border-ring/30',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:ring-2',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:ring-ring/10',
      )}
    >
      {children}
    </Command>
  </DialogContent>
)

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog {...props} />
)

export type ModelSelectorHeaderProps = ComponentProps<'div'> & {
  heading?: ReactNode
  description?: ReactNode
}

export const ModelSelectorHeader = ({
  className,
  heading = 'Choose model',
  description,
  children,
  ...props
}: ModelSelectorHeaderProps) => (
  <div
    data-slot="model-selector-header"
    className={cn('border-b border-border/45 px-4 pt-4 pb-3.5', className)}
    {...props}
  >
    <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">{heading}</p>
    {description ? (
      <div className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{description}</div>
    ) : null}
    {children}
  </div>
)

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>

export const ModelSelectorInput = ({ className, ...props }: ModelSelectorInputProps) => (
  <CommandInput
    className={cn(
      'h-auto py-0 text-[13px] tracking-[-0.01em] placeholder:text-muted-foreground/55',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorListProps = ComponentProps<typeof CommandList>

export const ModelSelectorList = ({ className, ...props }: ModelSelectorListProps) => (
  <CommandList
    className={cn('max-h-[min(22rem,52vh)] scroll-py-2 px-2 py-2', className)}
    {...props}
  />
)

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>

export const ModelSelectorEmpty = ({ className, ...props }: ModelSelectorEmptyProps) => (
  <CommandEmpty
    className={cn(
      'py-10 text-center text-[13px] tracking-[-0.01em] text-muted-foreground',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>

export const ModelSelectorGroup = ({ className, ...props }: ModelSelectorGroupProps) => (
  <CommandGroup
    className={cn(
      'p-0 **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:pt-3 **:[[cmdk-group-heading]]:pb-1.5',
      '**:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:font-medium',
      '**:[[cmdk-group-heading]]:tracking-[0.04em] **:[[cmdk-group-heading]]:text-muted-foreground/70',
      '**:[[cmdk-group-heading]]:uppercase',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>

export const ModelSelectorItem = ({ className, ...props }: ModelSelectorItemProps) => (
  <CommandItem
    className={cn(
      'gap-3 rounded-xl px-2.5 py-2.5 text-[13px]',
      'transition-[background-color,box-shadow,color] duration-150',
      'data-selected:bg-muted/55 data-selected:text-foreground',
      'data-[checked=true]:bg-muted/40 data-[checked=true]:ring-1 data-[checked=true]:ring-border/45',
      'data-[checked=true]:data-selected:bg-muted/60',
      'active:scale-[0.99]',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>

export const ModelSelectorShortcut = ({ className, ...props }: ModelSelectorShortcutProps) => (
  <CommandShortcut
    className={cn(
      'rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium tracking-normal tabular-nums',
      'text-muted-foreground group-data-selected/command-item:bg-muted/70 group-data-selected/command-item:text-foreground/80',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>

export const ModelSelectorSeparator = ({ className, ...props }: ModelSelectorSeparatorProps) => (
  <CommandSeparator className={cn('mx-2 my-1.5 bg-border/50', className)} {...props} />
)

export type ModelSelectorLogoProps = Omit<ComponentProps<'img'>, 'src' | 'alt'> & {
  provider:
    | 'moonshotai-cn'
    | 'lucidquery'
    | 'moonshotai'
    | 'zai-coding-plan'
    | 'alibaba'
    | 'xai'
    | 'vultr'
    | 'nvidia'
    | 'upstage'
    | 'groq'
    | 'github-copilot'
    | 'mistral'
    | 'vercel'
    | 'nebius'
    | 'deepseek'
    | 'alibaba-cn'
    | 'google-vertex-anthropic'
    | 'venice'
    | 'chutes'
    | 'cortecs'
    | 'github-models'
    | 'togetherai'
    | 'azure'
    | 'baseten'
    | 'huggingface'
    | 'opencode'
    | 'fastrouter'
    | 'google'
    | 'google-vertex'
    | 'cloudflare-workers-ai'
    | 'inception'
    | 'wandb'
    | 'openai'
    | 'zhipuai-coding-plan'
    | 'perplexity'
    | 'openrouter'
    | 'zenmux'
    | 'v0'
    | 'iflowcn'
    | 'synthetic'
    | 'deepinfra'
    | 'zhipuai'
    | 'submodel'
    | 'zai'
    | 'inference'
    | 'requesty'
    | 'morph'
    | 'lmstudio'
    | 'anthropic'
    | 'aihubmix'
    | 'fireworks-ai'
    | 'modelscope'
    | 'llama'
    | 'scaleway'
    | 'amazon-bedrock'
    | 'cerebras'
    // oxlint-disable-next-line typescript-eslint(ban-types) -- intentional pattern for autocomplete-friendly string union
    | (string & {})
}

export const ModelSelectorLogo = ({ provider, className, ...props }: ModelSelectorLogoProps) => (
  <img
    {...props}
    alt={`${provider} logo`}
    className={cn('size-3 dark:invert', className)}
    height={12}
    src={`https://models.dev/logos/${provider}.svg`}
    width={12}
  />
)

export type ModelSelectorLogoGroupProps = ComponentProps<'div'>

export const ModelSelectorLogoGroup = ({ className, ...props }: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      'flex shrink-0 items-center -space-x-1 [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 dark:[&>img]:bg-foreground',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorNameProps = ComponentProps<'span'>

export const ModelSelectorName = ({ className, ...props }: ModelSelectorNameProps) => (
  <span
    className={cn('flex-1 truncate text-left tracking-[-0.01em]', className)}
    {...props}
  />
)

export type ModelSelectorLogoBadgeProps = ComponentProps<'span'>

export const ModelSelectorLogoBadge = ({ className, ...props }: ModelSelectorLogoBadgeProps) => (
  <span
    data-slot="model-selector-logo-badge"
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-xl',
      'bg-muted/50 ring-1 ring-border/40',
      className,
    )}
    {...props}
  />
)
