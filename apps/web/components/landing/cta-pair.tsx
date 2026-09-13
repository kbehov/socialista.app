"use client";

import {
  AUTH_ERROR_MESSAGES,
  GoogleIcon,
} from "@/components/forms/auth-form-shared";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { WordRotate } from "@/components/ui/word-rotate";
import { persistBrowserTimezoneCookie } from "@/utils/timezone";
import { ImageIcon, Loader2, UserRound, Video } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { HERO } from "./content";
import { landingCtaPrimary } from "./landing-classes";

const PRIMARY_CTA_ICONS = [ImageIcon, Video, UserRound] as const;

type CtaPairProps = {
  primaryHref?: string;
  className?: string;
};

export function CtaPair({
  primaryHref = "/auth/signup",
  className,
}: CtaPairProps) {
  return (
    <div className={className}>
      <Button
        asChild
        size="lg"
        className={cn(landingCtaPrimary, "h-12 w-full px-7 text-[0.9375rem] sm:w-auto")}
      >
        <Link
          href={primaryHref}
          className="min-w-0 justify-center px-7 sm:min-w-[13.5rem]"
        >
          <WordRotate
            words={[...HERO.primaryCtaWords]}
            icons={[...PRIMARY_CTA_ICONS]}
            duration={2800}
            wrapperClassName="flex w-full justify-center py-0.5"
            className="text-[0.9375rem] font-medium"
            motionProps={{
              initial: { opacity: 0, y: 6 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -6 },
              transition: { duration: 0.2, ease: "easeOut" },
            }}
          />
        </Link>
      </Button>
      <HeroGoogleButton />
    </div>
  );
}

function HeroGoogleButton() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      persistBrowserTimezoneCookie();
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.default);
      setIsGoogleLoading(false);
    }
  };

  return (
    <RainbowButton
      type="button"
      variant="outline"
      size="lg"
      className="h-12 w-full rounded-full px-7 text-[0.9375rem] sm:w-auto"
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      {HERO.googleCta}
    </RainbowButton>
  );
}
