"use client";

import {
  AddProductDialog,
  type AddProductTab,
} from "@/components/products/add-product-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
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

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className={cn(
          "rounded-md px-3.5 font-medium",
          variant === "default" &&
            "transition-colors duration-150 active:scale-[0.98] motion-reduce:active:scale-100",
        )}
        onClick={() => setOpen(true)}
      >
        {showPlusIcon ? <PlusIcon className="size-3.5" /> : null}
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
