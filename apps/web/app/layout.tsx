import { auth } from '@/auth'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/context/auth-provider'
import { ThemeProvider } from '@/context/theme-provider'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Socialista',
    template: '%s · Socialista',
  },
  description:
    'Socialista is a social media content studio and workspace — AI images, product ads, carousels, video, and team files in one place.',
  applicationName: 'Socialista',
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn('h-full antialiased', geistSans.className, geistSans.variable, geistMono.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <AuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
