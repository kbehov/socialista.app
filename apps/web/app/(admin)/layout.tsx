import { auth } from '@/auth'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }
  const isAdmin = session.user?.role === 'admin'
  // check if the user is admin
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={<div>suspended...</div>}>
      <SidebarProvider>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </Suspense>
  )
}

export default DashboardLayout
