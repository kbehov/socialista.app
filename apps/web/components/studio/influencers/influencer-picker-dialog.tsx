"use client";

import {
  DashboardSegment,
  DashboardSegmentButton,
} from "@/components/dashboard";
import type { AttachMediaAccept } from "@/components/files/attach-media/types";
import { FilePreview } from "@/components/media/file-preview";
import { Filters, type Filter } from "@/components/reui/filters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  buildInfluencerFilterFields,
  filtersToInfluencerQuery,
  hasActiveInfluencerFilters,
} from "@/lib/studio/influencers/influencer-filters";
import { cn } from "@/lib/utils";
import {
  exploreInfluencers,
  getWorkspaceInfluencers,
} from "@/services/influencer.service";
import { getProjectId, useProjectStore } from "@/store/project.store";
import type { Influencer } from "@socialista/types";
import {
  ArrowLeftIcon,
  CheckIcon,
  CompassIcon,
  ListFilterIcon,
  Loader2Icon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Tab = "mine" | "explore";

export type InfluencerPickerMediaType = AttachMediaAccept;

export type InfluencerPickerSelection = {
  influencer: Influencer;
  url: string;
  kind: "image" | "video";
};

export type InfluencerPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  selectedIds?: string[];
  selectedUrls?: string[];
  excludeIds?: string[];
  selectMediaType?: InfluencerPickerMediaType;
  onSelect: (selection: InfluencerPickerSelection) => void;
};

function coverUrl(influencer: Influencer) {
  return influencer.coverImageUrl || influencer.galleryImageUrls[0];
}

function influencerPhotoUrls(influencer: Influencer) {
  return [
    ...new Set(
      [influencer.coverImageUrl, ...influencer.galleryImageUrls].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  ];
}

function allowsImages(type: InfluencerPickerMediaType) {
  return type === "image" || type === "media";
}

function allowsVideos(type: InfluencerPickerMediaType) {
  return type === "video" || type === "media";
}

function mediaStepCopy(type: InfluencerPickerMediaType) {
  if (type === "video") return "Pick a hook video to attach.";
  if (type === "media") return "Pick a photo or hook video to attach.";
  return "Pick a photo to use as a reference.";
}

function emptyMediaCopy(type: InfluencerPickerMediaType) {
  if (type === "video") return "This creator has no hook videos yet.";
  if (type === "media") return "This creator has no photos or hook videos yet.";
  return "This creator has no photos yet.";
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
        "group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-background text-left",
        "transition-[scale,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "active:scale-[0.96]",
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

function MediaTile({
  url,
  kind,
  selected,
  label,
  onSelect,
}: {
  url: string;
  kind: "image" | "video";
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-muted/30 text-left",
        "outline outline-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]",
        "transition-[scale,outline-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "active:scale-[0.96]",
        kind === "video" ? "aspect-9/16" : "aspect-[3/4]",
        selected && "outline-foreground/35",
      )}
    >
      <FilePreview
        src={url}
        alt={label}
        kind={kind}
        hoverPlay={kind === "video"}
        showBadge={kind === "video"}
      />
      {selected ? (
        <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background">
          <CheckIcon className="size-3.5" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}

function InfluencerMediaStep({
  influencer,
  selectMediaType,
  selectedUrls,
  onBack,
  onSelect,
}: {
  influencer: Influencer;
  selectMediaType: InfluencerPickerMediaType;
  selectedUrls: Set<string>;
  onBack: () => void;
  onSelect: (selection: InfluencerPickerSelection) => void;
}) {
  const photos = allowsImages(selectMediaType)
    ? influencerPhotoUrls(influencer)
    : [];
  const videos = allowsVideos(selectMediaType)
    ? (influencer.hookVideos ?? [])
    : [];
  const empty = photos.length === 0 && videos.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 px-2 text-[13px]"
        onClick={onBack}
      >
        <ArrowLeftIcon className="size-3.5" strokeWidth={1.75} />
        Creators
      </Button>

      <div className="max-h-[50vh] overflow-y-auto">
        {empty ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {emptyMediaCopy(selectMediaType)}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {photos.length > 0 ? (
              <section>
                {videos.length > 0 ? (
                  <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    Photos
                  </p>
                ) : null}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {photos.map((url, index) => (
                    <MediaTile
                      key={url}
                      url={url}
                      kind="image"
                      selected={selectedUrls.has(url)}
                      label={`${influencer.name} photo ${index + 1}`}
                      onSelect={() =>
                        onSelect({ influencer, url, kind: "image" })
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {videos.length > 0 ? (
              <section>
                {photos.length > 0 ? (
                  <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    Hooks
                  </p>
                ) : null}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {videos.map((clip) => (
                    <MediaTile
                      key={clip._id}
                      url={clip.videoUrl}
                      kind="video"
                      selected={selectedUrls.has(clip.videoUrl)}
                      label={`Hook video from ${influencer.name}`}
                      onSelect={() =>
                        onSelect({
                          influencer,
                          url: clip.videoUrl,
                          kind: "video",
                        })
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function InfluencerPickerDialog({
  open,
  onOpenChange,
  workspaceId,
  selectedIds = [],
  selectedUrls = [],
  excludeIds = [],
  selectMediaType = "image",
  onSelect,
}: InfluencerPickerDialogProps) {
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const [tab, setTab] = useState<Tab>("mine");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filter<string>[]>([]);
  const [items, setItems] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);

  const filterFields = useMemo(
    () => buildInfluencerFilterFields({ includeStatus: false }),
    [],
  );
  const filterQuery = useMemo(
    () => filtersToInfluencerQuery(filters),
    [filters],
  );
  const hasFilters = hasActiveInfluencerFilters(filters);
  const activeFilterCount = filters.filter((filter) => filter.values.length > 0)
    .length;
  const selectedUrlSet = useMemo(() => new Set(selectedUrls), [selectedUrls]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {
      query: query.trim() || undefined,
      limit: 24,
      sort: "newest" as const,
      ...filterQuery,
      status: "ready" as const,
    };
    const response =
      tab === "explore"
        ? await exploreInfluencers(params)
        : await getWorkspaceInfluencers(workspaceId, { ...params, projectId });
    setLoading(false);
    if (!response.success) {
      toast.error(response.message ?? "Failed to load creators");
      return;
    }
    setItems(response.data?.influencers ?? []);
  }, [filterQuery, projectId, query, tab, workspaceId]);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      void load();
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [load, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedInfluencer(null);
    onOpenChange(nextOpen);
  };

  const excluded = new Set(excludeIds);
  const searching = Boolean(query.trim());

  const handleMediaSelect = (selection: InfluencerPickerSelection) => {
    if (!selectedUrlSet.has(selection.url)) {
      onSelect(selection);
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedInfluencer
              ? `Attach from ${selectedInfluencer.name}`
              : "Attach an influencer"}
          </DialogTitle>
          <DialogDescription>
            {selectedInfluencer
              ? mediaStepCopy(selectMediaType)
              : "Use a ready creator as a face or style reference."}
          </DialogDescription>
        </DialogHeader>

        {selectedInfluencer ? (
          <InfluencerMediaStep
            influencer={selectedInfluencer}
            selectMediaType={selectMediaType}
            selectedUrls={selectedUrlSet}
            onBack={() => setSelectedInfluencer(null)}
            onSelect={handleMediaSelect}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
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

              <Filters
                filters={filters}
                fields={filterFields}
                onChange={setFilters}
                size="sm"
                className="gap-1.5"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 rounded-full border-border/60 px-2.5 text-[11px] font-medium shadow-none",
                      hasFilters && "border-border bg-muted/40 text-foreground",
                    )}
                  >
                    <ListFilterIcon className="size-3" strokeWidth={1.75} />
                    Filter
                    {activeFilterCount > 0 ? (
                      <span className="tabular-nums text-muted-foreground">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </Button>
                }
              />

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
                  {hasFilters || searching
                    ? "No matches. Try a different name or clear your filters."
                    : "No ready creators yet."}
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
                          setSelectedInfluencer(influencer);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
