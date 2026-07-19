'use client'

import { LANDING_NAV, WAITLIST_FORM_ID } from '@/app/(home)/_components/landing/content'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100vw-2rem,18rem)] border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-left text-sm font-medium">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
          {LANDING_NAV.map(item => (
            <SheetClose key={item.href} asChild>
              <Link href={item.href} className="px-1 py-2.5 text-sm text-foreground">
                {item.label}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link href="/auth/signin" className="px-1 py-2.5 text-sm text-muted-foreground">
              Sign in
            </Link>
          </SheetClose>
        </nav>
        <div className="mt-8">
          <SheetClose asChild>
            <Button className="w-full" asChild>
              <a href={`#${WAITLIST_FORM_ID}`}>Join waitlist</a>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
