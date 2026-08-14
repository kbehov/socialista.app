"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCESSORY_OPTIONS,
  AESTHETIC_OPTIONS,
  BODY_SHAPE_OPTIONS,
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEATURE_SUGGESTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  INFLUENCER_ACCESSORIES_MAX,
  INFLUENCER_SCENES_MAX,
  labelForSwatch,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SCENE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from "@/lib/studio/influencers/options";
import {
  FEATURE_ICONS,
  FIELD_ICONS,
  FieldIcon,
} from "@/lib/studio/influencers/option-icons";
import type { InfluencerCreateFormState } from "@/lib/studio/influencers/presets";
import { cn } from "@/lib/utils";
import type {
  InfluencerFacialHair,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
} from "@socialista/types";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  AdvancedCollapsible,
  ChipMultiSelect,
  ChipSingleSelect,
  ChoiceGrid,
  FieldLabel,
  FormFieldStack,
  OptionSegmented,
  SwatchPicker,
} from "./influencer-option-controls";

const NICHE_MAX = 3;
const AESTHETIC_MAX = 3;
const FEATURE_MAX = 3;
const BIO_MAX = 200;

const INPUT_CLASS =
  "h-10 rounded-[10px] border-border/50 bg-background text-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-muted-foreground/45 focus-visible:ring-ring/30";

const TEXTAREA_CLASS =
  "min-h-[4.5rem] resize-none rounded-[10px] border-border/50 bg-background text-sm leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-muted-foreground/45 focus-visible:ring-ring/30";

export type InfluencerCreateFormProps = {
  form: InfluencerCreateFormState;
  featureDraft: string;
  onFeatureDraftChange: (value: string) => void;
  onFormChange: (
    updater: (prev: InfluencerCreateFormState) => InfluencerCreateFormState,
  ) => void;
  onUpdateAppearance: <K extends keyof InfluencerCreateFormState["appearance"]>(
    key: K,
    value: InfluencerCreateFormState["appearance"][K],
  ) => void;
  onAddFeature: (raw: string) => void;
  onRemoveFeature: (tag: string) => void;
  hasStyleReferences?: boolean;
  disabled?: boolean;
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/75">
      {children}
    </p>
  );
}

function SwatchField({
  label,
  icon,
  valueLabel,
  children,
}: {
  label: string;
  icon?: React.ComponentProps<typeof FieldLabel>["icon"];
  valueLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.012em] text-foreground">
          {icon ? <FieldIcon icon={icon} /> : null}
          {label}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground/70">
          {valueLabel}
        </span>
      </div>
      {children}
    </div>
  );
}

const ETHNICITY_CHIP = cn(
  "rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
);

function EthnicityPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const trimmed = value.trim();
  const presetMatch = ETHNICITY_OPTIONS.find(
    (o) =>
      o.id.toLowerCase() === trimmed.toLowerCase() ||
      o.label.toLowerCase() === trimmed.toLowerCase(),
  );
  const [customMode, setCustomMode] = useState(
    () => trimmed.length > 0 && !presetMatch,
  );
  const showCustomInput = customMode || (trimmed.length > 0 && !presetMatch);

  return (
    <div className="space-y-2.5">
      <div
        role="radiogroup"
        aria-label="Ethnicity / background"
        className="flex flex-wrap gap-1.5"
      >
        {ETHNICITY_OPTIONS.map((option) => {
          const selected =
            !showCustomInput &&
            (trimmed.toLowerCase() === option.id.toLowerCase() ||
              trimmed.toLowerCase() === option.label.toLowerCase());
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => {
                setCustomMode(false);
                onChange(selected ? "" : option.id);
              }}
              className={cn(
                ETHNICITY_CHIP,
                selected
                  ? "bg-foreground text-background ring-foreground"
                  : "bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/35 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={showCustomInput}
          disabled={disabled}
          onClick={() => {
            setCustomMode(true);
            if (presetMatch) onChange("");
          }}
          className={cn(
            ETHNICITY_CHIP,
            showCustomInput
              ? "bg-foreground text-background ring-foreground"
              : "bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/35 hover:text-foreground",
          )}
        >
          Custom
        </button>
      </div>
      {showCustomInput ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Nigerian-Irish"
          disabled={disabled}
          className={INPUT_CLASS}
        />
      ) : null}
    </div>
  );
}

export function InfluencerCreateForm({
  form,
  featureDraft,
  onFeatureDraftChange,
  onFormChange,
  onUpdateAppearance,
  onAddFeature,
  onRemoveFeature,
  hasStyleReferences,
  disabled,
}: InfluencerCreateFormProps) {
  const {
    name,
    bio,
    gender,
    niche,
    scenes,
    ethnicity,
    appearance,
    aestheticTags,
    photoStyle,
  } = form;

  const showFacialHair = gender === "male";
  const showMakeup = gender === "female" || gender === "non-binary";

  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 space-y-6 border-0 p-0 disabled:opacity-60"
    >
      {hasStyleReferences ? (
        <p className="rounded-xl bg-muted/15 px-3.5 py-2.5 text-[13px] leading-relaxed text-muted-foreground ring-1 ring-border/30">
          References shape lighting and grade — the look below still defines the
          person.
        </p>
      ) : null}

      <FormFieldStack>
        <div>
          <FieldLabel htmlFor="influencer-name" icon={FIELD_ICONS.name}>
            Display name
          </FieldLabel>
          <Input
            id="influencer-name"
            value={name}
            onChange={(e) =>
              onFormChange((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Give them a name"
            autoComplete="off"
            maxLength={80}
            className={INPUT_CLASS}
          />
          <FieldHint>Leave blank to auto-name from the prompt.</FieldHint>
        </div>

        <div>
          <FieldLabel
            hint={`${niche.length}/${NICHE_MAX}`}
            icon={FIELD_ICONS.niche}
          >
            Niche
          </FieldLabel>
          <ChipMultiSelect
            aria-label="Niche"
            values={niche}
            options={NICHE_OPTIONS}
            onChange={(v) => onFormChange((prev) => ({ ...prev, niche: v }))}
            max={NICHE_MAX}
            iconGroup="niche"
          />
        </div>

        <div>
          <FieldLabel icon={FIELD_ICONS.ethnicity}>Background</FieldLabel>
          <EthnicityPicker
            value={ethnicity}
            onChange={(v) =>
              onFormChange((prev) => ({ ...prev, ethnicity: v }))
            }
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SwatchField
            label="Skin"
            icon={FIELD_ICONS.skinTone}
            valueLabel={labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone)}
          >
            <SwatchPicker
              aria-label="Skin tone"
              value={appearance.skinTone}
              options={SKIN_TONE_OPTIONS}
              onChange={(v) => onUpdateAppearance("skinTone", v)}
            />
          </SwatchField>
          <SwatchField
            label="Eyes"
            icon={FIELD_ICONS.eyeColor}
            valueLabel={labelForSwatch(EYE_COLOR_OPTIONS, appearance.eyeColor)}
          >
            <SwatchPicker
              aria-label="Eye color"
              value={appearance.eyeColor}
              options={EYE_COLOR_OPTIONS}
              onChange={(v) => onUpdateAppearance("eyeColor", v)}
            />
          </SwatchField>
        </div>

        <SwatchField
          label="Hair color"
          icon={FIELD_ICONS.hairColor}
          valueLabel={labelForSwatch(HAIR_COLOR_OPTIONS, appearance.hairColor)}
        >
          <SwatchPicker
            aria-label="Hair color"
            value={appearance.hairColor}
            options={HAIR_COLOR_OPTIONS}
            onChange={(v) => onUpdateAppearance("hairColor", v)}
          />
        </SwatchField>

        <div>
          <FieldLabel icon={FIELD_ICONS.hairStyle}>Hair style</FieldLabel>
          <ChipSingleSelect
            aria-label="Hair style"
            value={appearance.hairStyle}
            options={HAIR_STYLE_OPTIONS}
            onChange={(v) => onUpdateAppearance("hairStyle", v)}
            iconGroup="hairStyle"
          />
        </div>

        {showFacialHair ? (
          <div>
            <FieldLabel icon={FIELD_ICONS.facialHair}>Facial hair</FieldLabel>
            <ChipSingleSelect
              aria-label="Facial hair"
              value={appearance.facialHair}
              options={FACIAL_HAIR_OPTIONS}
              onChange={(v) =>
                onUpdateAppearance("facialHair", v as InfluencerFacialHair)
              }
              iconGroup="facialHair"
            />
          </div>
        ) : null}

        {showMakeup ? (
          <div>
            <FieldLabel icon={FIELD_ICONS.makeup}>Makeup</FieldLabel>
            <ChipSingleSelect
              aria-label="Makeup"
              value={appearance.makeup}
              options={MAKEUP_OPTIONS}
              onChange={(v) =>
                onUpdateAppearance("makeup", v as InfluencerMakeupStyle)
              }
              iconGroup="makeup"
            />
          </div>
        ) : null}

        <div>
          <FieldLabel icon={FIELD_ICONS.bodyShape}>Body shape</FieldLabel>
          <ChoiceGrid
            aria-label="Body shape"
            value={appearance.bodyShape}
            options={BODY_SHAPE_OPTIONS}
            onChange={(v) => onUpdateAppearance("bodyShape", v)}
            iconGroup="bodyShape"
          />
        </div>

        <div>
          <FieldLabel icon={FIELD_ICONS.height}>Height</FieldLabel>
          <OptionSegmented
            aria-label="Height"
            value={appearance.height}
            options={HEIGHT_OPTIONS}
            onChange={(v: InfluencerHeight) => onUpdateAppearance("height", v)}
            layoutId="form-height-indicator"
          />
        </div>

        <AdvancedCollapsible
          label="Distinguishing features"
          icon={FIELD_ICONS.features}
          defaultOpen={appearance.distinguishingFeatures.length > 0}
        >
          <FieldLabel
            hint={`${appearance.distinguishingFeatures.length}/${FEATURE_MAX}`}
          >
            Pick up to {FEATURE_MAX}
          </FieldLabel>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FEATURE_SUGGESTIONS.map((tag) => {
              const selected = appearance.distinguishingFeatures.includes(tag);
              const atMax =
                !selected &&
                appearance.distinguishingFeatures.length >= FEATURE_MAX;
              const FeatureIcon = FEATURE_ICONS[tag];
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={atMax}
                  onClick={() =>
                    selected ? onRemoveFeature(tag) : onAddFeature(tag)
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    selected
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-muted/20 text-muted-foreground ring-border/25 hover:bg-muted/35 hover:text-foreground",
                    atMax && "cursor-not-allowed opacity-40",
                  )}
                >
                  {FeatureIcon ? (
                    <FeatureIcon
                      className="size-3.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  ) : null}
                  {tag}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              value={featureDraft}
              onChange={(e) => onFeatureDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddFeature(featureDraft);
                }
              }}
              placeholder="Custom feature…"
              className={INPUT_CLASS}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0 rounded-[10px] border-border/50"
              onClick={() => onAddFeature(featureDraft)}
              aria-label="Add feature"
            >
              <PlusIcon className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </AdvancedCollapsible>

        <div>
          <FieldLabel icon={FIELD_ICONS.photoStyle}>Photo style</FieldLabel>
          <ChoiceGrid
            aria-label="Photo style"
            value={photoStyle}
            options={PHOTO_STYLE_OPTIONS}
            onChange={(v) =>
              onFormChange((prev) => ({
                ...prev,
                photoStyle: v as InfluencerPhotoStyle,
              }))
            }
            iconGroup="photoStyle"
          />
        </div>

        <div>
          <FieldLabel
            hint={`${aestheticTags.length}/${AESTHETIC_MAX}`}
            icon={FIELD_ICONS.aesthetic}
          >
            Aesthetic
          </FieldLabel>
          <ChipMultiSelect
            aria-label="Aesthetic"
            values={aestheticTags}
            options={AESTHETIC_OPTIONS}
            onChange={(v) =>
              onFormChange((prev) => ({ ...prev, aestheticTags: v }))
            }
            max={AESTHETIC_MAX}
            iconGroup="aesthetic"
          />
        </div>

        <div>
          <FieldLabel
            hint={`${scenes.length}/${INFLUENCER_SCENES_MAX}`}
            icon={FIELD_ICONS.scenes}
          >
            Scenes
          </FieldLabel>
          <ChipMultiSelect
            aria-label="Scenes"
            values={scenes}
            options={SCENE_OPTIONS}
            onChange={(v) => onFormChange((prev) => ({ ...prev, scenes: v }))}
            max={INFLUENCER_SCENES_MAX}
            iconGroup="scene"
          />
        </div>

        <div>
          <FieldLabel
            hint={`${appearance.accessories.length}/${INFLUENCER_ACCESSORIES_MAX}`}
            icon={FIELD_ICONS.accessories}
          >
            Accessories
          </FieldLabel>
          <ChipMultiSelect
            aria-label="Accessories"
            values={appearance.accessories}
            options={ACCESSORY_OPTIONS}
            onChange={(v) => onUpdateAppearance("accessories", v)}
            max={INFLUENCER_ACCESSORIES_MAX}
            iconGroup="accessory"
          />
        </div>

        <AdvancedCollapsible
          label="Team bio"
          icon={FIELD_ICONS.bio}
          defaultOpen={bio.length > 0}
        >
          <FieldLabel
            htmlFor="influencer-bio"
            hint={`${bio.length}/${BIO_MAX}`}
          >
            Bio
          </FieldLabel>
          <Textarea
            id="influencer-bio"
            value={bio}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                bio: e.target.value.slice(0, BIO_MAX),
              }))
            }
            placeholder="Internal note — not sent to the image model"
            rows={2}
            className={TEXTAREA_CLASS}
          />
        </AdvancedCollapsible>
      </FormFieldStack>
    </fieldset>
  );
}
