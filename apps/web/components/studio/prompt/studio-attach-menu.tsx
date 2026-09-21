"use client";

import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { StudioInputActionTooltip } from "@/components/studio/prompt/studio-input-action-tooltip";
import {
  AttachImagesDialog,
  type AttachedMedia,
} from "@/components/files/attach-images-dialog";
import { ProductPickerDialog } from "@/components/studio/static-ads/product-picker-dialog";
import { InfluencerPickerDialog } from "@/components/studio/influencers/influencer-picker-dialog";
import { cn } from "@/lib/utils";
import { STUDIO_ATTACH_PLUS_BUTTON_CLASS } from "@/components/studio/prompt/studio-composer-surface";
import { getWorkspaceProducts } from "@/services/product.service";
import { getProjectId, useProjectStore } from "@/store/project.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { Product } from "@socialista/types";
import type { SelectedProductImage } from "@/types/static-ads.types";
import {
  FilesIcon,
  PackageIcon,
  PlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type StudioAttachSource =
  | "upload"
  | "library"
  | "influencer"
  | "product";

type StudioAttachMenuItem =
  | { kind: "files" }
  | { kind: StudioAttachSource };

const PICKER_ITEMS: Record<
  Exclude<StudioAttachSource, "upload" | "library">,
  { label: string; description: string; icon: typeof PackageIcon }
> = {
  influencer: {
    label: "Influencer",
    description: "Ready creator",
    icon: UserRoundIcon,
  },
  product: {
    label: "Product",
    description: "Catalog photo",
    icon: PackageIcon,
  },
};

const FILES_ITEM = {
  label: "Files",
  description: "Upload or browse library",
  icon: FilesIcon,
} as const;

const MACHINE_NAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function humanFileName(name?: string) {
  if (!name) return null;
  const base = name.replace(/\.[a-z0-9]+$/i, "").trim();
  if (!base || MACHINE_NAME_RE.test(base)) return null;
  return base;
}

export function attachmentChipLabel(file: AttachedMedia): string {
  if (file.label) return file.label;
  if (file.source === "influencer") return "Influencer";
  if (file.source === "product") return "Product";
  return humanFileName(file.name) ?? "Reference";
}

function coverUrl(influencer: {
  coverImageUrl?: string;
  galleryImageUrls: string[];
}) {
  return influencer.coverImageUrl || influencer.galleryImageUrls[0];
}

type StudioAttachMenuProps = {
  sources: readonly StudioAttachSource[];
  attachments: AttachedMedia[];
  onAttachmentsChange: (files: AttachedMedia[]) => void;
  maxAttachments: number;
  workspaceId?: string;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
};

function buildMenuItems(sources: readonly StudioAttachSource[]): StudioAttachMenuItem[] {
  const hasUpload = sources.includes("upload");
  const hasLibrary = sources.includes("library");
  const items: StudioAttachMenuItem[] = [];

  if (hasUpload || hasLibrary) {
    items.push({ kind: "files" });
  }

  for (const source of sources) {
    if (source === "upload" || source === "library") continue;
    items.push({ kind: source });
  }

  return items;
}

export function StudioAttachMenu({
  sources,
  attachments,
  onAttachmentsChange,
  maxAttachments,
  workspaceId: workspaceIdProp,
  disabled,
  disabledReason,
  className,
}: StudioAttachMenuProps) {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const workspaceId =
    workspaceIdProp ?? currentWorkspace?._id ?? currentWorkspace?.id;
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<"upload" | "library">("upload");
  const [influencerOpen, setInfluencerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsTruncated, setProductsTruncated] = useState(false);

  const menuItems = useMemo(() => buildMenuItems(sources), [sources]);
  const hasFilesSource =
    sources.includes("upload") || sources.includes("library");

  useEffect(() => {
    setProducts([]);
    setProductsTruncated(false);
  }, [projectId]);

  const mediaAttachments = attachments.filter(
    (file) => file.source === "upload" || file.source === "library",
  );
  const reservedCount = attachments.length - mediaAttachments.length;
  const mediaSlots = Math.max(0, maxAttachments - reservedCount);
  const atMax = attachments.length >= maxAttachments;

  const mergeMedia = useCallback(
    (nextMedia: AttachedMedia[]) => {
      const kept = attachments.filter(
        (file) => file.source === "influencer" || file.source === "product",
      );
      onAttachmentsChange([
        ...kept,
        ...nextMedia.slice(0, Math.max(0, maxAttachments - kept.length)),
      ]);
    },
    [attachments, maxAttachments, onAttachmentsChange],
  );

  const addAttachment = useCallback(
    (file: AttachedMedia) => {
      if (
        attachments.some((item) => item.id === file.id || item.url === file.url)
      ) {
        toast.error("That reference is already attached");
        return;
      }
      if (attachments.length >= maxAttachments) {
        toast.error(`You can attach up to ${maxAttachments} references`);
        return;
      }
      onAttachmentsChange([...attachments, file]);
    },
    [attachments, maxAttachments, onAttachmentsChange],
  );

  const openProductPicker = useCallback(async () => {
    setProductOpen(true);
    if (!workspaceId || products.length > 0) return;
    setProductsLoading(true);
    const response = await getWorkspaceProducts(workspaceId, {
      limit: 50,
      sort: "-updatedAt",
      projectId,
    });
    setProductsLoading(false);
    if (!response.success) {
      toast.error(response.message ?? "Failed to load products");
      return;
    }
    const next = response.data?.products ?? [];
    setProducts(next);
    setProductsTruncated((response.meta?.total ?? next.length) > next.length);
  }, [products.length, workspaceId, projectId]);

  const handleMenuItem = (item: StudioAttachMenuItem) => {
    if (item.kind === "files") {
      setMediaTab("upload");
      setMediaOpen(true);
      return;
    }
    if (item.kind === "influencer") {
      setInfluencerOpen(true);
      return;
    }
    void openProductPicker();
  };

  const selectedProducts: SelectedProductImage[] = attachments
    .filter((file) => file.source === "product")
    .map((file) => ({
      url: file.url,
      label: file.label,
      productId: file.productId,
    }));

  const attachButtonClass = cn(STUDIO_ATTACH_PLUS_BUTTON_CLASS, className);

  const attachTooltip = disabled
    ? (disabledReason ?? "Add references")
    : attachments.length > 0
      ? `Add references (${attachments.length} attached)`
      : "Add references";

  const trigger = (
    <StudioInputActionTooltip label={attachTooltip}>
      <PromptInputActionMenuTrigger
        aria-label={
          attachments.length > 0
            ? `Add references, ${attachments.length} attached`
            : "Add references"
        }
        className={attachButtonClass}
        disabled={disabled}
        size="icon-xs"
        type="button"
      >
        <PlusIcon className="size-4 shrink-0" strokeWidth={2} />
      </PromptInputActionMenuTrigger>
    </StudioInputActionTooltip>
  );

  if (menuItems.length === 0) {
    return (
      <PromptInputButton
        aria-label="Add references"
        className={attachButtonClass}
        disabled
        size="icon-xs"
        tooltip="No attach sources"
        type="button"
      >
        <PlusIcon className="size-4 shrink-0" strokeWidth={2} />
      </PromptInputButton>
    );
  }

  const singleItem = menuItems.length === 1 ? menuItems[0] : null;

  const singleDisabled =
    disabled ||
    (singleItem?.kind === "influencer" && atMax) ||
    (singleItem?.kind === "product" && atMax) ||
    (singleItem?.kind === "files" && mediaSlots === 0 && atMax);

  const triggerButton = singleItem ? (
    <StudioInputActionTooltip
      label={
        singleItem.kind === "influencer"
          ? atMax
            ? "Only one photo can be attached"
            : "Attach a creator photo"
          : singleItem.kind === "files"
            ? "Files — upload or library"
            : attachTooltip
      }
    >
      <PromptInputButton
        aria-label={
          singleItem.kind === "files"
            ? "Open files"
            : singleItem.kind === "influencer"
              ? "Attach a creator photo"
              : "Add references"
        }
        className={attachButtonClass}
        disabled={singleDisabled}
        onClick={() => handleMenuItem(singleItem)}
        size="icon-xs"
        type="button"
      >
        <PlusIcon className="size-4 shrink-0" strokeWidth={2} />
      </PromptInputButton>
    </StudioInputActionTooltip>
  ) : (
    <PromptInputActionMenu>
      {trigger}
      <PromptInputActionMenuContent className="w-52 p-1">
        {menuItems.map((item) => {
          if (item.kind === "files") {
            const Icon = FILES_ITEM.icon;
            return (
              <PromptInputActionMenuItem
                key="files"
                className="gap-2.5 rounded-lg px-2 py-1.5"
                disabled={disabled || (atMax && mediaSlots === 0)}
                onSelect={() => handleMenuItem(item)}
              >
                <Icon
                  className="size-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-medium leading-none">
                    {FILES_ITEM.label}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-none text-muted-foreground">
                    {FILES_ITEM.description}
                  </span>
                </span>
              </PromptInputActionMenuItem>
            );
          }

          const meta = PICKER_ITEMS[item.kind];
          const Icon = meta.icon;
          return (
            <PromptInputActionMenuItem
              key={item.kind}
              className="gap-2.5 rounded-lg px-2 py-1.5"
              disabled={disabled || atMax}
              onSelect={() => handleMenuItem(item)}
            >
              <Icon
                className="size-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] font-medium leading-none">
                  {meta.label}
                </span>
                <span className="mt-0.5 text-[11px] leading-none text-muted-foreground">
                  {meta.description}
                </span>
              </span>
            </PromptInputActionMenuItem>
          );
        })}
      </PromptInputActionMenuContent>
    </PromptInputActionMenu>
  );

  return (
    <>
      {triggerButton}

      {hasFilesSource ? (
        <AttachImagesDialog
          open={mediaOpen}
          accept="image"
          onOpenChange={setMediaOpen}
          maxSelect={mediaSlots}
          initialSelected={mediaAttachments}
          defaultTab={mediaTab}
          workspaceId={workspaceId}
          title="Files"
          description="Upload from your device or pick from your workspace library."
          onSelect={mergeMedia}
        />
      ) : null}

      {sources.includes("influencer") && workspaceId ? (
        <InfluencerPickerDialog
          open={influencerOpen}
          onOpenChange={setInfluencerOpen}
          workspaceId={workspaceId}
          selectedIds={attachments.flatMap((file) =>
            file.influencerId ? [file.influencerId] : [],
          )}
          excludeIds={attachments.flatMap((file) =>
            file.influencerId ? [file.influencerId] : [],
          )}
          onSelect={(influencer) => {
            const url = coverUrl(influencer);
            if (!url) {
              toast.error("That creator has no portrait yet");
              return;
            }
            addAttachment({
              id: `influencer:${influencer._id}`,
              url,
              name: influencer.name,
              kind: "image",
              source: "influencer",
              label: influencer.name,
              influencerId: influencer._id,
            });
          }}
        />
      ) : null}

      {sources.includes("product") && workspaceId ? (
        <ProductPickerDialog
          open={productOpen}
          onOpenChange={setProductOpen}
          products={products}
          workspaceId={workspaceId}
          selected={selectedProducts}
          loading={productsLoading}
          productsTruncated={productsTruncated}
          onConfirm={(images) => {
            const image = images[0];
            if (!image) return;
            addAttachment({
              id: image.productId
                ? `product:${image.productId}`
                : `product:${image.url}`,
              url: image.url,
              name: image.label,
              kind: "image",
              source: "product",
              label: image.label ?? "Product",
              productId: image.productId,
            });
          }}
        />
      ) : null}
    </>
  );
}
