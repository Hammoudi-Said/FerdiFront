'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'

export function DashboardLayout({ children }) {
  const router = useRouter()
  const { user, token, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    if (!token && !isLoading) {
      router.push('/auth/login')
    }
  }, [token, isLoading, router])

  useEffect(() => {
    if (token && !user) {
      checkAuth()
    }
  }, [token, user, checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!token || !user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}