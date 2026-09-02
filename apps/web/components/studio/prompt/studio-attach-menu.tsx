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
import {
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
} from "@/components/studio/prompt/studio-composer-surface";
import { getWorkspaceProducts } from "@/services/product.service";
import { getProjectId, useProjectStore } from "@/store/project.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { Product } from "@socialista/types";
import type { SelectedProductImage } from "@/types/static-ads.types";
import {
  FolderIcon,
  ImagePlusIcon,
  PackageIcon,
  UploadIcon,
  UserRoundIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type StudioAttachSource =
  | "upload"
  | "library"
  | "influencer"
  | "product";

const SOURCE_ITEMS: Record<
  StudioAttachSource,
  { label: string; description: string; icon: typeof UploadIcon }
> = {
  upload: {
    label: "Upload",
    description: "From your device",
    icon: UploadIcon,
  },
  library: {
    label: "Library",
    description: "Workspace files",
    icon: FolderIcon,
  },
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

function coverUrl(influencer: {
  coverImageUrl?: string;
  galleryImageUrls: string[];
}) {
  return influencer.coverImageUrl || influencer.galleryImageUrls[0];
}

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

  const handleSource = (source: StudioAttachSource) => {
    if (source === "upload" || source === "library") {
      setMediaTab(source);
      setMediaOpen(true);
      return;
    }
    if (source === "influencer") {
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

  const attachButtonClass = cn(
    STUDIO_TOOL_BUTTON_CLASS,
    attachments.length > 0 && STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
    className,
  );

  const attachTooltip = disabled
    ? (disabledReason ?? "Attach references")
    : "Attach reference images";

  const trigger = (
    <StudioInputActionTooltip label={attachTooltip}>
      <PromptInputActionMenuTrigger
        aria-label="Attach references"
        className={attachButtonClass}
        disabled={disabled}
        size="xs"
        type="button"
      >
        <ImagePlusIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
          {attachments.length > 0 ? attachments.length : "Attach"}
        </span>
      </PromptInputActionMenuTrigger>
    </StudioInputActionTooltip>
  );

  if (sources.length === 0) {
    return (
      <PromptInputButton
        aria-label="Attach references"
        className={attachButtonClass}
        disabled
        size="xs"
        tooltip="No attach sources"
        type="button"
      >
        <ImagePlusIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
          Attach
        </span>
      </PromptInputButton>
    );
  }

  return (
    <>
      <PromptInputActionMenu>
        {trigger}
        <PromptInputActionMenuContent className="w-52 p-1">
          {sources.map((source) => {
            const item = SOURCE_ITEMS[source];
            const Icon = item.icon;
            return (
              <PromptInputActionMenuItem
                key={source}
                className="gap-2.5 rounded-lg px-2 py-1.5"
                disabled={
                  disabled ||
                  (atMax && source !== "upload" && source !== "library") ||
                  ((source === "upload" || source === "library") &&
                    mediaSlots === 0)
                }
                onSelect={() => handleSource(source)}
              >
                <Icon
                  className="size-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-medium leading-none">
                    {item.label}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-none text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </PromptInputActionMenuItem>
            );
          })}
        </PromptInputActionMenuContent>
      </PromptInputActionMenu>

      {sources.includes("upload") || sources.includes("library") ? (
        <AttachImagesDialog
          open={mediaOpen}
          accept="image"
          onOpenChange={setMediaOpen}
          maxSelect={mediaSlots}
          initialSelected={mediaAttachments}
          defaultTab={mediaTab}
          workspaceId={workspaceId}
          title="Attach reference images"
          description="Guide the model with product shots, mood boards, or style references."
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
