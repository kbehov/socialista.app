"use client";

import {
  DashboardSegment,
  DashboardSegmentButton,
} from "@/components/dashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  exploreInfluencers,
  getWorkspaceInfluencers,
} from "@/services/influencer.service";
import type { Influencer } from "@socialista/types";
import {
  CheckIcon,
  CompassIcon,
  Loader2Icon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Tab = "mine" | "explore";

function coverUrl(influencer: Influencer) {
  return influencer.coverImageUrl || influencer.galleryImageUrls[0];
}

function InfluencerPickCard({
  influencer,
  selected,
  disabled,
  onSelect,
}: {
  influencer: Influencer;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const src = coverUrl(influencer);

  return (
    <button
      type="button"
      disabled={disabled && !selected}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-background text-left transition",
        "active:scale-[0.98]",
        selected
          ? "border-foreground/30 shadow-sm"
          : "border-border/55 hover:border-border hover:shadow-sm",
        disabled && !selected && "opacity-50",
      )}
    >
      <span className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
        {src ? (
          <Image
            alt=""
            aria-hidden
            className="object-cover"
            fill
            sizes="160px"
            src={src}
            unoptimized
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <UserRoundIcon className="size-6" strokeWidth={1.5} />
          </span>
        )}
        {selected ? (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background">
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </span>
      <span className="truncate px-2.5 py-2 text-[13px] font-medium">
        {influencer.name}
      </span>
    </button>
  );
}

export type InfluencerPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  selectedIds?: string[];
  excludeIds?: string[];
  onSelect: (influencer: Influencer) => void;
};

export function InfluencerPickerDialog({
  open,
  onOpenChange,
  workspaceId,
  selectedIds = [],
  excludeIds = [],
  onSelect,
}: InfluencerPickerDialogProps) {
  const [tab, setTab] = useState<Tab>("mine");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {
      query: query.trim() || undefined,
      limit: 24,
      status: "ready" as const,
      sort: "newest" as const,
    };
    const response =
      tab === "explore"
        ? await exploreInfluencers(params)
        : await getWorkspaceInfluencers(workspaceId, params);
    setLoading(false);
    if (!response.success) {
      toast.error(response.message ?? "Failed to load creators");
      return;
    }
    setItems(response.data?.influencers ?? []);
  }, [query, tab, workspaceId]);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      void load();
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [load, open]);

  const excluded = new Set(excludeIds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attach an influencer</DialogTitle>
          <DialogDescription>
            Use a ready creator as a face or style reference.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <DashboardSegment label="Creator library">
              <DashboardSegmentButton
                active={tab === "mine"}
                onClick={() => setTab("mine")}
              >
                Mine
              </DashboardSegmentButton>
              <DashboardSegmentButton
                active={tab === "explore"}
                onClick={() => setTab("explore")}
              >
                <CompassIcon className="size-3" />
                Explore
              </DashboardSegmentButton>
            </DashboardSegment>
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-8 pl-8"
              />
            </div>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2Icon className="size-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No ready creators yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map((influencer) => {
                  const blocked = excluded.has(influencer._id);
                  return (
                    <InfluencerPickCard
                      key={influencer._id}
                      influencer={influencer}
                      selected={selectedIds.includes(influencer._id)}
                      disabled={blocked}
                      onSelect={() => {
                        if (blocked) return;
                        onSelect(influencer);
                        onOpenChange(false);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
