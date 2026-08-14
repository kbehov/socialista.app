import type { AttachedMedia } from '@/components/files/attach-images-dialog'

/** Primary product hero for static-ad generation — prefers catalog product refs. */
export function resolveStaticAdProductImage(
  attachments: readonly AttachedMedia[],
): AttachedMedia | undefined {
  return attachments.find(file => file.source === 'product') ?? attachments[0]
}
