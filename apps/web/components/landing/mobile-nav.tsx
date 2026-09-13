"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChevronRight, MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LANDING_NAV } from "./content";
import {
  landingCtaPrimary,
  landingCtaSecondary,
  landingNavLink,
} from "./landing-classes";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
        <SheetHeader>
          <SheetTitle className="text-left text-base">Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {LANDING_NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`${landingNavLink} rounded-md px-2 py-2.5 text-sm`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Button
              asChild
              variant="outline"
              size="lg"
              className={landingCtaSecondary}
            >
              <Link href="/auth/signup" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </Button>
            <Button asChild size="lg" className={cn(landingCtaPrimary, "gap-1.5")}>
              <Link href="/auth/signup" onClick={() => setOpen(false)}>
                Start for $0
                <ChevronRight className="size-4 opacity-80" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
