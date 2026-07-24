'use client'

import { PostRow } from '@/components/posts/post-row'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { AccountSummary, Post } from '@socialista/types'

type PostsTableProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  className?: string
}

export function PostsTable({ posts, accountsById, className }: PostsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Post
            </TableHead>
            <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
              Account
            </TableHead>
            <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
              Type
            </TableHead>
            <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Status
            </TableHead>
            <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
              Date
            </TableHead>
            <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map(post => (
            <PostRow key={post._id} post={post} account={accountsById[post.accountId]} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
