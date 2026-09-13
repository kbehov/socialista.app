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
      <Button asChild size="lg" className={landingCtaPrimary}>
        <Link
          href={primaryHref}
          className="min-w-[12.75rem] justify-center px-6"
        >
          <WordRotate
            words={[...HERO.primaryCtaWords]}
            icons={[...PRIMARY_CTA_ICONS]}
            duration={2800}
            wrapperClassName="py-0"
            className="text-sm font-medium"
            motionProps={{
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -8 },
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
      className="rounded-full px-6"
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
