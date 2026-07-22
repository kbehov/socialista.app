export type StaticAdCopy = {
  headline: string;
  subheadline: string;
  cta: string;
  brandName: string;
};

export type StaticAdCopyInput = {
  headline?: string;
  subheadline?: string;
  cta?: string;
  brandName?: string;
};

export const AD_LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  bg: "Bulgarian",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  pl: "Polish",
  nl: "Dutch",
  ro: "Romanian",
  el: "Greek",
  ar: "Arabic",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  cs: "Czech",
  hu: "Hungarian",
  tr: "Turkish",
  he: "Hebrew",
};

export function getAdLanguageLabel(code: string): string {
  return AD_LANGUAGE_LABELS[code] ?? code;
}
