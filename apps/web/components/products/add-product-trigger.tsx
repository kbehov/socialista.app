"use client";

import {
  AddProductDialog,
  type AddProductTab,
} from "@/components/products/add-product-dialog";
import { Button } from "@/components/ui/button";
import { Link2Icon, PackageIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AddProductTriggerProps = {
  workspaceId: string;
  label?: string;
  variant?: "default" | "outline";
  showPlusIcon?: boolean;
  defaultTab?: AddProductTab;
};

export function AddProductTrigger({
  workspaceId,
  label = "Add product",
  variant = "default",
  showPlusIcon = true,
  defaultTab = "url",
}: AddProductTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const Icon = showPlusIcon
    ? PlusIcon
    : defaultTab === "manual"
      ? PackageIcon
      : Link2Icon;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className="h-9 rounded-full px-4"
        onClick={() => setOpen(true)}
      >
        <Icon className="size-3.5" />
        {label}
      </Button>

      <AddProductDialog
        open={open}
        onOpenChange={setOpen}
        workspaceId={workspaceId}
        defaultTab={defaultTab}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
