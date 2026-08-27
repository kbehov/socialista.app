"use client";

import {
  DashboardSegment,
  DashboardSegmentButton,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { uploadToWorkspace } from "@/services/files.service";
import { createProduct, extractProduct } from "@/services/product.service";
import { getProjectId, useProjectStore } from "@/store/project.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { ExtractProductResponse, ProductKind } from "@socialista/types";
import { PRODUCT_KINDS } from "@socialista/types";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  ImageIcon,
  Loader2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export type AddProductTab = "url" | "manual";

type AddProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  defaultTab?: AddProductTab;
  onCreated?: () => void;
};

type ExtractState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ExtractProductResponse }
  | { status: "error"; message: string };

const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  physical: "Physical",
  digital: "Digital",
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseExtractedPrice(price?: string | number) {
  if (price === undefined || price === null) return 0;
  if (typeof price === "number" && Number.isFinite(price) && price >= 0)
    return price;
  if (typeof price === "string") {
    const parsed = Number.parseFloat(price.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
  return 0;
}

function parseManualPrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function formatExtractedPrice(price?: string | number, currency?: string) {
  const amount = parseExtractedPrice(price);
  const code =
    currency && currency.length === 3 ? currency.toUpperCase() : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ProductKindField({
  value,
  disabled,
  onChange,
}: {
  value: ProductKind;
  disabled?: boolean;
  onChange: (kind: ProductKind) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground/56">Type</Label>
      <DashboardSegment label="Product type" className="w-full">
        {PRODUCT_KINDS.map((kind) => (
          <DashboardSegmentButton
            key={kind}
            active={value === kind}
            disabled={disabled}
            className="h-8 flex-1 justify-center"
            onClick={() => onChange(kind)}
          >
            {PRODUCT_KIND_LABELS[kind]}
          </DashboardSegmentButton>
        ))}
      </DashboardSegment>
    </div>
  );
}

export function AddProductDialog({
  open,
  onOpenChange,
  workspaceId,
  defaultTab = "url",
  onCreated,
}: AddProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddProductForm
          key={defaultTab}
          workspaceId={workspaceId}
          defaultTab={defaultTab}
          onClose={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      ) : null}
    </Dialog>
  );
}

function AddProductForm({
  workspaceId,
  defaultTab,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  defaultTab: AddProductTab;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const storageLimit = useWorkspaceStore(
    (s) => s.currentWorkspace?.limits.storage ?? 0,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<AddProductTab>(defaultTab);
  const [url, setUrl] = useState("");
  const [extractState, setExtractState] = useState<ExtractState>({
    status: "idle",
  });
  const [urlKind, setUrlKind] = useState<ProductKind>("physical");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualKind, setManualKind] = useState<ProductKind>("physical");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isExtracting, startExtract] = useTransition();
  const [isCreating, startCreate] = useTransition();

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Use a product photo");
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleExtract = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setExtractState({
        status: "error",
        message: "Paste a product URL to continue.",
      });
      return;
    }
    if (!isValidUrl(trimmed)) {
      setExtractState({
        status: "error",
        message: "Enter a valid http or https URL.",
      });
      return;
    }

    startExtract(async () => {
      setExtractState({ status: "loading" });
      const response = await extractProduct(trimmed);

      if (!response.success || !response.data) {
        setExtractState({
          status: "error",
          message:
            response.message ?? "Could not extract product data from this URL.",
        });
        return;
      }

      if (!response.data.name?.trim()) {
        setExtractState({
          status: "error",
          message: "No product name was found. Try a direct product page URL.",
        });
        return;
      }

      setExtractState({ status: "success", data: response.data });
    });
  };

  const handleCreateFromUrl = () => {
    if (extractState.status !== "success") return;

    const { data } = extractState;
    const productName = data.name?.trim();
    if (!productName) return;

    startCreate(async () => {
      const response = await createProduct({
        workspaceId,
        projectId,
        name: productName,
        description: data.description?.trim() ?? "",
        url: data.url,
        price: parseExtractedPrice(data.price),
        images: data.image ?? [],
        kind: urlKind,
      });

      if (!response.success) {
        toast.error(response.message ?? "Failed to add product");
        return;
      }

      toast.success(`Added “${productName}” to your catalog`);
      onClose();
      onCreated?.();
    });
  };

  const handleCreateManual = () => {
    const productName = name.trim();
    const parsedPrice = parseManualPrice(price);
    const sourceUrl = manualUrl.trim();

    if (!productName || parsedPrice === null || isCreating) return;
    if (sourceUrl && !isValidUrl(sourceUrl)) {
      toast.error("Enter a valid http or https URL");
      return;
    }

    startCreate(async () => {
      let images: string[] = [];

      if (photoFile) {
        if (storageLimit <= 0) {
          toast.error("This workspace has no storage available");
          return;
        }

        const formData = new FormData();
        formData.append("file", photoFile);
        const upload = await uploadToWorkspace(workspaceId, formData);
        const uploadedUrl = upload.data?.url;
        if (!upload.success || !uploadedUrl) {
          toast.error(upload.message ?? "Couldn’t upload product photo");
          return;
        }
        images = [uploadedUrl];
      }

      const response = await createProduct({
        workspaceId,
        projectId,
        name: productName,
        description: description.trim(),
        url: sourceUrl,
        price: parsedPrice,
        images,
        kind: manualKind,
      });

      if (!response.success) {
        toast.error(response.message ?? "Failed to add product");
        return;
      }

      toast.success(`Added “${productName}” to your catalog`);
      onClose();
      onCreated?.();
    });
  };

  const isBusy =
    isExtracting || isCreating || extractState.status === "loading";
  const canCreateFromUrl = extractState.status === "success" && !isBusy;
  const canCreateManual =
    Boolean(name.trim()) && parseManualPrice(price) !== null && !isBusy;

  return (
    <DialogContent
      className="flex max-h-[min(720px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      showCloseButton={!isBusy}
    >
      <div className="shrink-0 space-y-4 border-b border-foreground/10 px-6 py-5 pr-12">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-base font-medium tracking-[-0.02em]">
            Add product
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/56">
            {tab === "url"
              ? "Paste a product page URL and we'll pull the name, images, and price."
              : "Add a name, price, and optional photo. Mark it as physical or digital."}
          </DialogDescription>
        </DialogHeader>

        <DashboardSegment label="Import method" className="w-full">
          <DashboardSegmentButton
            active={tab === "url"}
            disabled={isBusy}
            className="h-8 flex-1 justify-center"
            onClick={() => setTab("url")}
          >
            From URL
          </DashboardSegmentButton>
          <DashboardSegmentButton
            active={tab === "manual"}
            disabled={isBusy}
            className="h-8 flex-1 justify-center"
            onClick={() => setTab("manual")}
          >
            Manual
          </DashboardSegmentButton>
        </DashboardSegment>
      </div>

      {tab === "url" ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="product-url"
                className="text-xs font-medium text-foreground/56"
              >
                Product URL
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="product-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://store.example.com/products/..."
                  value={url}
                  disabled={isBusy}
                  className="h-10 min-w-0 flex-1 rounded-md text-sm"
                  onChange={(event) => {
                    setUrl(event.target.value);
                    if (extractState.status === "error") {
                      setExtractState({ status: "idle" });
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleExtract();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 shrink-0 rounded-md px-4 sm:w-auto"
                  disabled={isBusy || !url.trim()}
                  onClick={handleExtract}
                >
                  {isExtracting || extractState.status === "loading" ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <>
                      Extract
                      <ArrowRightIcon className="size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "overflow-hidden rounded-md border transition-colors",
                extractState.status === "error"
                  ? "border-destructive/30 bg-destructive/5"
                  : extractState.status === "success"
                    ? "border-foreground/10 bg-foreground/[0.02]"
                    : "border-foreground/10 bg-foreground/[0.02]",
              )}
            >
              {extractState.status === "idle" && (
                <div className="flex min-h-[132px] flex-col justify-center px-5 py-6">
                  <p className="text-sm font-medium text-foreground">
                    Preview will appear here
                  </p>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-foreground/56">
                    Works with most Shopify, WooCommerce, and standard product
                    pages.
                  </p>
                </div>
              )}

              {(isExtracting || extractState.status === "loading") && (
                <div className="flex min-h-[132px] flex-col items-start justify-center gap-3 px-5 py-6">
                  <Loader2Icon className="size-5 animate-spin text-foreground/44" />
                  <p className="text-sm text-foreground/56">
                    Reading product details…
                  </p>
                </div>
              )}

              {extractState.status === "error" && (
                <div className="flex items-start gap-3 px-5 py-5">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-destructive">
                      Couldn&apos;t extract product
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-destructive/80">
                      {extractState.message}
                    </p>
                  </div>
                </div>
              )}

              {extractState.status === "success" && (
                <div className="flex flex-col gap-5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="relative mx-auto shrink-0 sm:mx-0">
                      {extractState.data.image?.[0] ? (
                        <div className="relative size-24 overflow-hidden rounded-md bg-foreground/[0.04] sm:size-28">
                          <Image
                            src={extractState.data.image[0]}
                            alt=""
                            fill
                            unoptimized
                            sizes="112px"
                            className="object-cover"
                          />
                          {(extractState.data.image.length ?? 0) > 1 && (
                            <span className="absolute right-1 bottom-1 bg-foreground/72 px-1.5 py-0.5 text-[10px] font-medium text-background">
                              +{extractState.data.image.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex size-24 items-center justify-center rounded-md bg-foreground/[0.04] sm:size-28">
                          <ImageIcon
                            className="size-5 text-foreground/44"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-snug tracking-[-0.01em] text-foreground">
                          {extractState.data.name}
                        </p>
                        {extractState.data.description ? (
                          <p className="max-h-24 overflow-y-auto text-sm leading-relaxed text-foreground/56">
                            {extractState.data.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <p className="text-base font-medium tabular-nums tracking-[-0.01em] text-foreground">
                          {formatExtractedPrice(
                            extractState.data.price,
                            extractState.data.currency,
                          )}
                        </p>
                        <p className="truncate text-sm text-foreground/56">
                          {getHostname(extractState.data.url)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ProductKindField
                    value={urlKind}
                    disabled={isBusy}
                    onChange={setUrlKind}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground/56">
                Photo
              </Label>
              {photoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="relative size-20 overflow-hidden rounded-md bg-foreground/[0.04]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium tracking-[-0.01em]">
                      {photoFile?.name ?? "Product photo"}
                    </p>
                    <p className="text-sm text-foreground/56">
                      Optional. A square image works best.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    disabled={isBusy}
                    aria-label="Remove product photo"
                    onClick={clearPhoto}
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragOver(false);
                    const file = event.dataTransfer.files[0];
                    if (file) handlePhotoFile(file);
                  }}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 rounded-md border border-foreground/10 bg-foreground/[0.02] px-4 py-5 text-left transition-colors",
                    "duration-150 ease-out active:scale-[0.99] motion-reduce:active:scale-100",
                    isDragOver && "border-foreground/18 bg-foreground/[0.05]",
                    isBusy && "opacity-60",
                  )}
                >
                  <UploadIcon
                    className="size-5 text-foreground/44"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-medium">
                    Drop a product photo
                  </span>
                  <span className="text-sm text-foreground/56">
                    or click to upload
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) handlePhotoFile(file);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="product-name"
                className="text-xs font-medium text-foreground/56"
              >
                Name
              </Label>
              <Input
                id="product-name"
                autoComplete="off"
                placeholder="Summer linen shirt"
                value={name}
                disabled={isBusy}
                className="h-10 rounded-md text-sm"
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="product-price"
                className="text-xs font-medium text-foreground/56"
              >
                Price
              </Label>
              <div className="relative max-w-[160px]">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-foreground/56">
                  $
                </span>
                <Input
                  id="product-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  disabled={isBusy}
                  className="h-10 rounded-md pl-7 text-sm tabular-nums"
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>
            </div>

            <ProductKindField
              value={manualKind}
              disabled={isBusy}
              onChange={setManualKind}
            />

            <div className="space-y-2">
              <Label
                htmlFor="product-description"
                className="text-xs font-medium text-foreground/56"
              >
                Description
                <span className="font-normal text-foreground/44">
                  {" "}
                  · optional
                </span>
              </Label>
              <Textarea
                id="product-description"
                placeholder="What should ads and studio tools know about this product?"
                value={description}
                disabled={isBusy}
                className="min-h-20 rounded-md text-sm"
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="product-source-url"
                className="text-xs font-medium text-foreground/56"
              >
                Product URL
                <span className="font-normal text-foreground/44">
                  {" "}
                  · optional
                </span>
              </Label>
              <Input
                id="product-source-url"
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://…"
                value={manualUrl}
                disabled={isBusy}
                className="h-10 rounded-md text-sm"
                onChange={(event) => setManualUrl(event.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <DialogFooter className="shrink-0 border-t border-foreground/10 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          disabled={isBusy}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="rounded-md"
          disabled={tab === "url" ? !canCreateFromUrl : !canCreateManual}
          onClick={tab === "url" ? handleCreateFromUrl : handleCreateManual}
        >
          {isCreating ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Adding…
            </>
          ) : (
            "Add to catalog"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
