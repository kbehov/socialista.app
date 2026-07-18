type WorkspaceRequiredProps = {
  message: string
}

export function WorkspaceRequired({ message }: WorkspaceRequiredProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
      {message}
    </div>
  )
}
