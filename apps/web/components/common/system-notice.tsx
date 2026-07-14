import { AlertCircleIcon } from 'lucide-react'
type SystemNoticeProps = {
  title: string
  description: string
  action: React.ReactNode
}

export function SystemNotice({ title, description, action }: SystemNoticeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted/60">
        <AlertCircleIcon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-4 max-w-sm space-y-1.5">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="mt-5">{action}</div>
    </div>
  )
}
