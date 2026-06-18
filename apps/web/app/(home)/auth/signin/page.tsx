import { SignInForm } from '@/components/forms/sigin-form'
import { Suspense } from 'react'

function SignInFormFallback() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="h-[520px] animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
    </div>
  )
}

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<SignInFormFallback />}>
        <SignInForm />
      </Suspense>
    </main>
  )
}
