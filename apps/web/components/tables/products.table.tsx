"use client";

import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { deleteProduct } from "@/services/product.service";
import { formatRelativeTime } from "@/utils/format";
import type { Product } from "@socialista/types";
import {
  ExternalLinkIcon,
  ImageIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PRODUCT_ROW_GRID =
  "sm:grid sm:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,7.5rem)_2rem] sm:items-center sm:gap-3 lg:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,7.5rem)_4.25rem_2rem]";

type ProductsTableProps = {
  products: Product[];
  className?: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getSourceLabel(product: Product) {
  if (product.url) {
    try {
      return new URL(product.url).hostname.replace(/^www\./, "");
    } catch {
      return "External store";
    }
  }
  return "Manual";
}

function ProductThumbnail({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const thumbnail = images[0];

  if (!thumbnail) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-foreground/[0.04]">
        <ImageIcon
          className="size-3.5 text-foreground/44"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-foreground/[0.04]">
      <Image
        src={thumbnail}
        alt=""
        fill
        unoptimized
        sizes="44px"
        className="object-cover"
      />
      <span className="sr-only">{name}</span>
    </div>
  );
}

export function ProductsTable({ products, className }: ProductsTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const response = await deleteProduct(deleteTarget._id);
    setIsDeleting(false);

    if (!response.success) {
      toast.error(response.message ?? "Failed to delete product");
      return;
    }

    toast.success(`Removed “${deleteTarget.name}”`);
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <>
      <div className={cn("min-w-0", className)}>
        <div
          className={cn(
            "hidden border-b border-foreground/10 py-2",
            PRODUCT_ROW_GRID,
          )}
          aria-hidden
        >
          <span className="text-[11px] font-medium text-foreground/56">
            Product
          </span>
          <span className="text-[11px] font-medium text-foreground/56">
            Price
          </span>
          <span className="text-[11px] font-medium text-foreground/56">
            Source
          </span>
          <span className="hidden text-[11px] font-medium text-foreground/56 lg:block">
            Added
          </span>
          <span aria-hidden />
        </div>

        <ul className="divide-y divide-foreground/10">
          {products.map((product, index) => {
            const sourceLabel = getSourceLabel(product);
            const hasSourceUrl = Boolean(product.url);
            const kindLabel =
              product.kind === "digital" ? "Digital" : "Physical";
            const extraPhotos = Math.max(0, product.images.length - 1);
            const mobileMeta = [
              sourceLabel,
              kindLabel,
              extraPhotos > 0 ? `${product.images.length} photos` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li
                key={product._id}
                className={cn(
                  "group transition-colors duration-150 ease-out hover:bg-foreground/[0.05]",
                  index % 2 === 1 && "bg-foreground/[0.03]",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 py-2",
                    PRODUCT_ROW_GRID,
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ProductThumbnail
                      images={product.images}
                      name={product.name}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-medium leading-tight tracking-[-0.01em] text-foreground"
                        title={product.description || undefined}
                      >
                        {product.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] leading-tight text-foreground/56 sm:hidden">
                        {mobileMeta}
                      </p>
                    </div>
                  </div>

                  <div className="hidden text-[13px] font-medium tabular-nums tracking-[-0.01em] text-foreground sm:block">
                    {formatPrice(product.price)}
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="flex min-w-0 items-baseline gap-1.5 text-[13px] text-foreground/56">
                      <span className="min-w-0 truncate">{sourceLabel}</span>
                      <span className="shrink-0">· {kindLabel}</span>
                    </p>
                  </div>

                  <div className="hidden lg:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default text-[13px] text-foreground/56">
                          {formatRelativeTime(product.createdAt)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {formatDate(product.createdAt)}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <span className="text-[13px] font-medium tabular-nums tracking-[-0.01em] text-foreground sm:hidden">
                      {formatPrice(product.price)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-8 rounded-md text-foreground/56 hover:text-foreground"
                          aria-label={`Actions for ${product.name}`}
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {hasSourceUrl ? (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLinkIcon />
                                View source
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        ) : null}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete product"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be removed from your catalog. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete product"
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
