'use client'

import { publishExistingPost } from '@/actions/post.actions'
import { deletePost } from '@/services/post.service'
import type { Post } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export function usePostViewActions() {
  const router = useRouter()
  const [isPublishing, startPublishTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setEditSheetOpen(true)
  }

  const handleEditSheetOpenChange = (open: boolean) => {
    setEditSheetOpen(open)
    if (!open) setEditingPost(null)
  }

  const handlePostNow = (post: Post) => {
    if (isPublishing) return

    setPublishingPostId(post._id)
    startPublishTransition(async () => {
      const result = await publishExistingPost(post._id)
      setPublishingPostId(null)

      if (!result.success) {
        toast.error(result.message ?? 'Failed to publish post')
        return
      }

      toast.success('Post is publishing')
      router.refresh()
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || isDeleting) return

    const postId = deleteTarget._id
    startDeleteTransition(async () => {
      const response = await deletePost(postId)

      if (!response.success) {
        toast.error(response.message ?? 'Failed to delete post')
        return
      }

      toast.success('Post deleted')
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return {
    editingPost,
    editSheetOpen,
    handleEditPost,
    handleEditSheetOpenChange,
    publishingPostId,
    handlePostNow,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    isDeleting,
  }
}
