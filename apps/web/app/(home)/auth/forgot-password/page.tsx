import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { Suspense } from 'react'

function ForgotPasswordFormFallback() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="h-[360px] animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<ForgotPasswordFormFallback />}>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  )
}
