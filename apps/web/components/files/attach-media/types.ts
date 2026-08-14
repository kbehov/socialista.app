export type AttachMediaAccept = "image" | "video" | "media";

export type AttachMediaSource = "upload" | "library" | "influencer" | "product";

export type AttachedMedia = {
  id: string;
  url: string;
  name?: string;
  width?: number;
  height?: number;
  kind: "image" | "video";
  source: AttachMediaSource;
  /** Short chip label (influencer name, product name, "Reference"). */
  label?: string;
  influencerId?: string;
  productId?: string;
};

/** @deprecated Prefer `AttachedMedia`. */
export type AttachedImage = AttachedMedia;

export type AttachMediaCopy = {
  noun: string;
  nounPlural: string;
  emptyRoot: string;
  emptyFolder: string;
  emptyRootHint: string;
  emptyFolderHint: string;
  dropHint: string;
  formatsHint: string;
  removeHint: string;
  librarySection: string;
  attachOne: string;
  attachMany: (count: number) => string;
  uploadedOne: string;
  uploadedMany: (count: number) => string;
  notAllowed: (name: string) => string;
};

export type AttachImagesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (files: AttachedMedia[]) => void;
  /**
   * Which file kinds can be attached.
   * - `image` — images only (default)
   * - `video` — videos only
   * - `media` — images and videos
   */
  accept?: AttachMediaAccept;
  /** Maximum number of files the user can attach. */
  maxSelect?: number;
  /** @deprecated Use `maxSelect`. */
  maxImagesSelect?: number;
  /** Override max upload size in bytes. Defaults by `accept`. */
  maxSize?: number;
  workspaceId?: string;
  title?: string;
  description?: string;
  /** Seeds the draft selection when the dialog opens. */
  initialSelected?: AttachedMedia[];
  /** Which tab to show when the dialog opens. */
  defaultTab?: "upload" | "library";
};
