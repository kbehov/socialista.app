import { EmptyState } from '@/components/common/empty-state'
import { LayoutDashboardIcon } from 'lucide-react'

type WorkspaceRequiredProps = {
  message: string
}

export function WorkspaceRequired({ message }: WorkspaceRequiredProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <EmptyState
        icon={LayoutDashboardIcon}
        title="Workspace required"
        description={message}
        minHeight="sm"
        variant="ghost"
      />
    </div>
  )
}
