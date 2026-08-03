import type { AttachMediaAccept, AttachMediaCopy } from './types'

export function buildAttachMediaCopy(accept: AttachMediaAccept): AttachMediaCopy {
  switch (accept) {
    case 'video':
      return {
        noun: 'video',
        nounPlural: 'videos',
        emptyRoot: 'No videos yet',
        emptyFolder: 'This folder has no videos',
        emptyRootHint: 'Upload videos in the Upload tab, or add files from your workspace library.',
        emptyFolderHint: 'Go back and pick another folder, or upload a new video.',
        dropHint: 'Drop videos here',
        formatsHint: 'MP4, WebM, MOV',
        removeHint: 'Remove a video to attach another.',
        librarySection: 'Videos',
        attachOne: 'Attach video',
        attachMany: count => `Attach ${count} videos`,
        uploadedOne: 'Video uploaded',
        uploadedMany: count => `${count} videos uploaded`,
        notAllowed: name => `“${name}” is not a video.`,
      }
    case 'media':
      return {
        noun: 'file',
        nounPlural: 'files',
        emptyRoot: 'No media yet',
        emptyFolder: 'This folder is empty',
        emptyRootHint: 'Upload images or videos in the Upload tab, or pick from your library.',
        emptyFolderHint: 'Go back and pick another folder, or upload new media.',
        dropHint: 'Drop images or videos here',
        formatsHint: 'PNG, JPG, WebP, MP4, WebM',
        removeHint: 'Remove a file to attach another.',
        librarySection: 'Media',
        attachOne: 'Attach file',
        attachMany: count => `Attach ${count} files`,
        uploadedOne: 'File uploaded',
        uploadedMany: count => `${count} files uploaded`,
        notAllowed: name => `“${name}” is not a supported image or video.`,
      }
    case 'image':
    default:
      return {
        noun: 'image',
        nounPlural: 'images',
        emptyRoot: 'No images yet',
        emptyFolder: 'This folder is empty',
        emptyRootHint: 'Upload images in the Upload tab, or add files from your workspace library.',
        emptyFolderHint: 'Go back and pick another folder, or upload new images.',
        dropHint: 'Drop images here',
        formatsHint: 'PNG, JPG, WebP',
        removeHint: 'Remove an image to attach another.',
        librarySection: 'Images',
        attachOne: 'Attach image',
        attachMany: count => `Attach ${count} images`,
        uploadedOne: 'Image uploaded',
        uploadedMany: count => `${count} images uploaded`,
        notAllowed: name => `“${name}” is not an image.`,
      }
  }
}

export function defaultAttachMediaTitle(accept: AttachMediaAccept): string {
  switch (accept) {
    case 'video':
      return 'Attach videos'
    case 'media':
      return 'Attach media'
    case 'image':
    default:
      return 'Attach images'
  }
}

export function defaultAttachMediaDescription(accept: AttachMediaAccept): string {
  switch (accept) {
    case 'video':
      return 'Upload new videos or pick from your workspace library.'
    case 'media':
      return 'Upload images or videos, or pick from your workspace library.'
    case 'image':
    default:
      return 'Upload new images or pick from your workspace library.'
  }
}
