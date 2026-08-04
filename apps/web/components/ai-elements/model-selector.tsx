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
      'gap-0 overflow-hidden rounded-[1.25rem] border border-border/40 bg-background p-0',
      'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_16px_-8px_rgba(0,0,0,0.08),0_32px_64px_-24px_rgba(0,0,0,0.2)]',
      'sm:max-w-104',
      'dark:border-border/50',
      'dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_24px_-10px_rgba(0,0,0,0.4),0_36px_72px_-24px_rgba(0,0,0,0.6)]',
      className,
    )}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command
      className={cn(
        'rounded-none border-0 bg-transparent p-0 text-foreground shadow-none',
        '**:data-[slot=command-input-wrapper]:border-b **:data-[slot=command-input-wrapper]:border-border/35',
        '**:data-[slot=command-input-wrapper]:!p-0 **:data-[slot=command-input-wrapper]:px-3.5! **:data-[slot=command-input-wrapper]:py-3!',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:h-9',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:rounded-[0.625rem]',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:border-border/35',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:bg-muted/20',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:shadow-none',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:ring-0',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:transition-[border-color,box-shadow,background-color] **:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:duration-150',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:border-ring/25',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:bg-background',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:ring-2',
        '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:ring-ring/8',
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
    className={cn('border-b border-border/35 px-4 pt-4 pb-3', className)}
    {...props}
  >
    <p className="text-[15px] font-semibold leading-none tracking-[-0.022em] text-foreground">
      {heading}
    </p>
    {description ? (
      <div className="mt-2 text-[12px] leading-[1.45] tracking-[-0.01em] text-muted-foreground/75">
        {description}
      </div>
    ) : null}
    {children}
  </div>
)

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>

export const ModelSelectorInput = ({ className, ...props }: ModelSelectorInputProps) => (
  <CommandInput
    className={cn(
      'h-auto py-0 text-[13px] tracking-[-0.012em] placeholder:text-muted-foreground/50',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorListProps = ComponentProps<typeof CommandList>

export const ModelSelectorList = ({ className, ...props }: ModelSelectorListProps) => (
  <CommandList
    className={cn('max-h-[min(22rem,52vh)] scroll-py-1.5 px-2 py-2', className)}
    {...props}
  />
)

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>

export const ModelSelectorEmpty = ({ className, ...props }: ModelSelectorEmptyProps) => (
  <CommandEmpty
    className={cn(
      'py-12 text-center text-[13px] tracking-[-0.01em] text-muted-foreground/80',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>

export const ModelSelectorGroup = ({ className, ...props }: ModelSelectorGroupProps) => (
  <CommandGroup
    className={cn(
      'p-0 **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:pt-3.5 **:[[cmdk-group-heading]]:pb-1',
      '**:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:font-medium',
      '**:[[cmdk-group-heading]]:tracking-[0.06em] **:[[cmdk-group-heading]]:text-muted-foreground/55',
      '**:[[cmdk-group-heading]]:uppercase',
      'not-first:mt-0.5',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>

export const ModelSelectorItem = ({ className, ...props }: ModelSelectorItemProps) => (
  <CommandItem
    className={cn(
      'gap-3 rounded-xl px-2.5 py-2 text-[13px]',
      'transition-[background-color,box-shadow,color,transform] duration-150',
      'data-selected:bg-muted/50 data-selected:text-foreground',
      'data-[checked=true]:bg-muted/35',
      'data-[checked=true]:data-selected:bg-muted/55',
      'active:scale-[0.985]',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>

export const ModelSelectorShortcut = ({ className, ...props }: ModelSelectorShortcutProps) => (
  <CommandShortcut
    className={cn(
      'rounded-md px-0 py-0 text-[11px] font-medium tracking-[-0.01em] tabular-nums',
      'bg-transparent text-muted-foreground/70',
      'group-data-selected/command-item:text-muted-foreground',
      className,
    )}
    {...props}
  />
)

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>

export const ModelSelectorSeparator = ({ className, ...props }: ModelSelectorSeparatorProps) => (
  <CommandSeparator className={cn('mx-2 my-1.5 bg-border/40', className)} {...props} />
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
    className={cn('flex-1 truncate text-left tracking-[-0.014em]', className)}
    {...props}
  />
)

export type ModelSelectorLogoBadgeProps = ComponentProps<'span'>

export const ModelSelectorLogoBadge = ({ className, ...props }: ModelSelectorLogoBadgeProps) => (
  <span
    data-slot="model-selector-logo-badge"
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-[0.625rem]',
      'bg-muted/40 ring-1 ring-border/30',
      'transition-[background-color,box-shadow] duration-150',
      'group-data-selected/command-item:bg-muted/60 group-data-selected/command-item:ring-border/40',
      className,
    )}
    {...props}
  />
)
